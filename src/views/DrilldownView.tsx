import React, { useState } from 'react';
import { DataFilters } from '../components/DataFilters';
import { PBIDataTable } from '../components/PBIDataTable';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { AsinMetadata, PBIData } from '../types/data';
import { getUniqueValues } from '../utils/dataProcessing';

interface DrilldownViewProps {
  metadata: AsinMetadata[];
  pbiData: PBIData[];
  filesUploaded: {
    metadata: boolean;
    pbi: boolean;
  };
}

export const DrilldownView: React.FC<DrilldownViewProps> = ({
  metadata,
  pbiData,
  filesUploaded,
}) => {
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedProductType, setSelectedProductType] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const allFilesUploaded = filesUploaded.metadata && filesUploaded.pbi;

  const filteredData = pbiData.filter((item) => {
    const metadataItem = metadata.find(m => m.asin === item.ASIN);
    if (!metadataItem) return false;

    return (
      (!selectedBrand || metadataItem.brand === selectedBrand) &&
      (!selectedCategory || metadataItem.category === selectedCategory) &&
      (!selectedClient || metadataItem.client === selectedClient) &&
      (!selectedSubcategory || metadataItem.subcategory === selectedSubcategory) &&
      (!selectedProductType || metadataItem['product-type'] === selectedProductType)
    );
  });

  return (
    <>
      {isLoading && <LoadingOverlay />}

      {allFilesUploaded && !isLoading && (
        <>
          <DataFilters
            brands={getUniqueValues(metadata, 'brand')}
            categories={getUniqueValues(metadata, 'category')}
            clients={getUniqueValues(metadata, 'client')}
            subcategories={getUniqueValues(metadata, 'subcategory')}
            productTypes={getUniqueValues(metadata, 'product-type')}
            selectedBrand={selectedBrand}
            selectedCategory={selectedCategory}
            selectedClient={selectedClient}
            selectedSubcategory={selectedSubcategory}
            selectedProductType={selectedProductType}
            onBrandChange={setSelectedBrand}
            onCategoryChange={setSelectedCategory}
            onClientChange={setSelectedClient}
            onSubcategoryChange={setSelectedSubcategory}
            onProductTypeChange={setSelectedProductType}
          />

          <PBIDataTable
            data={filteredData}
            metadata={metadata}
          />
        </>
      )}
    </>
  );
};