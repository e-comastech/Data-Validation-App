import React, { useState, useEffect } from 'react';
import { DataFilters } from '../components/DataFilters';
import { DataTable } from '../components/DataTable';
import { DailyChart } from '../components/DailyChart';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { DataSummary } from '../components/DataSummary';
import { OrderData, PBIData, ComparisonData } from '../types/data';
import { compareData, getUniqueValues, aggregateByAsin, aggregateByMarketplace } from '../utils/dataProcessing';

interface ComparisonViewProps {
  data: OrderData[];
  pbiData: PBIData[];
  filesUploaded: {
    orders: boolean;
    pbi: boolean;
  };
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  data,
  pbiData,
  filesUploaded,
}) => {
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    if (filesUploaded.orders && filesUploaded.pbi) {
      setIsLoading(true);
      setTimeout(() => {
        const comparison = compareData(data, pbiData);
        setComparisonData(comparison);
        setIsLoading(false);
      }, 2000);
    }
  }, [filesUploaded, data, pbiData]);

  const filteredData = data.filter((item) => {
    return !selectedStatus || item['order-status'] === selectedStatus;
  });

  const asinTotals = aggregateByAsin(filteredData);
  const marketplaceTotals = aggregateByMarketplace(filteredData);

  const allFilesUploaded = filesUploaded.orders && filesUploaded.pbi;

  return (
    <>
      {isLoading && <LoadingOverlay />}

      {allFilesUploaded && !isLoading && comparisonData && (
        <>
          <DataSummary comparisonData={comparisonData} />
          
          <DataFilters
            orderStatuses={getUniqueValues(data, 'order-status')}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <DataTable
              data={filteredData}
              asinTotals={asinTotals}
              marketplaceTotals={marketplaceTotals}
              comparisonData={comparisonData}
            />
            <DailyChart data={filteredData} />
          </div>
        </>
      )}
    </>
  );
};