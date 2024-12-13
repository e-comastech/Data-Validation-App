import Papa from 'papaparse';
import { OrderData, AsinMetadata, PBIData, ComparisonData } from '../types/data';
import { validateMetadataHeaders, validateMetadataRow, normalizeMetadataRow } from './validators';
import { processOrderRow } from './parsers/orderParser';
import { processPBIRow } from './parsers/pbiParser';

export const processMetadataFile = (file: File): Promise<AsinMetadata[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
      complete: (results) => {
        try {
          if (!results.data || !Array.isArray(results.data)) {
            throw new Error('Invalid metadata file format');
          }

          const headerError = validateMetadataHeaders(results.meta.fields || []);
          if (headerError) {
            throw new Error(headerError);
          }

          const processedData = results.data
            .filter(row => validateMetadataRow(row))
            .map(row => normalizeMetadataRow(row));

          if (processedData.length === 0) {
            throw new Error('No valid metadata rows found');
          }

          resolve(processedData);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => reject(new Error(`Failed to parse metadata file: ${error.message}`))
    });
  });
};

export const processFileData = (file: File): Promise<OrderData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          if (!results.data || !Array.isArray(results.data)) {
            throw new Error('Invalid file format');
          }

          const processedData = results.data
            .map(row => processOrderRow(row))
            .filter(row => row !== null);

          resolve(processedData);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => reject(new Error(`Failed to parse file: ${error.message}`))
    });
  });
};

export const processPBIData = (file: File): Promise<PBIData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          if (!results.data || !Array.isArray(results.data)) {
            throw new Error('Invalid PBI file format');
          }

          const processedData = results.data
            .map(row => processPBIRow(row))
            .filter((row): row is PBIData => row !== null);

          resolve(processedData);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => reject(new Error(`Failed to parse PBI file: ${error.message}`))
    });
  });
};

export const findMissingAsins = (orderData: OrderData[], comparisonData: ComparisonData[]): string[] => {
  const orderAsins = new Set(orderData.map(order => order.asin));
  const pbiAsins = new Set(comparisonData.map(item => item.asin));
  
  return Array.from(orderAsins).filter(asin => !pbiAsins.has(asin));
};

export const compareData = (orderData: OrderData[], pbiData: PBIData[]): ComparisonData[] => {
  const asinTotals = aggregateByAsin(orderData);
  
  return asinTotals.map(({ asin, total, units }) => {
    const pbiItem = pbiData.find(item => item.ASIN === asin);
    const pbiSales = pbiItem?.Sales || 0;
    const pbiUnits = pbiItem?.Units || 0;

    const salesDiscrepancy = total > 0 ? ((pbiSales - total) / total) * 100 : 0;
    const unitsDiscrepancy = units > 0 ? ((pbiUnits - units) / units) * 100 : 0;

    return {
      asin,
      total,
      units,
      pbiSales,
      pbiUnits,
      salesDiscrepancy,
      unitsDiscrepancy
    };
  });
};

export const aggregateByAsin = (data: OrderData[]) => {
  const totals = new Map<string, { total: number; units: number }>();

  data.forEach(item => {
    const current = totals.get(item.asin) || { total: 0, units: 0 };
    totals.set(item.asin, {
      total: current.total + item['item-price-eur'],
      units: current.units + item.quantity
    });
  });

  return Array.from(totals.entries()).map(([asin, { total, units }]) => ({
    asin,
    total,
    units
  }));
};

export const aggregateByMarketplace = (data: OrderData[]) => {
  const totals = new Map<string, { total: number; units: number }>();

  data.forEach(item => {
    const marketplace = item['sales-channel'];
    const current = totals.get(marketplace) || { total: 0, units: 0 };
    totals.set(marketplace, {
      total: current.total + item['item-price-eur'],
      units: current.units + item.quantity
    });
  });

  return Array.from(totals.entries()).map(([marketplace, { total, units }]) => ({
    marketplace,
    total,
    units
  }));
};

export const aggregateByDate = (data: OrderData[]) => {
  const totals = new Map<string, { total: number; units: number }>();

  data.forEach(item => {
    const date = item.date;
    const current = totals.get(date) || { total: 0, units: 0 };
    totals.set(date, {
      total: current.total + item['item-price-eur'],
      units: current.units + item.quantity
    });
  });

  return Array.from(totals.entries())
    .map(([date, { total, units }]) => ({
      date,
      total,
      units
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

export const getUniqueValues = (data: any[], field: string): string[] => {
  const values = new Set(data.map(item => item[field]).filter(Boolean));
  return Array.from(values).sort();
};