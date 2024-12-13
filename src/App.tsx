import React, { useState, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { ScenarioSelector } from './components/ScenarioSelector';
import { ComparisonView } from './views/ComparisonView';
import { DrilldownView } from './views/DrilldownView';
import { OrderData, AsinMetadata, PBIData } from './types/data';
import { processFileData, processMetadataFile, processPBIData } from './utils/dataProcessing';

function App() {
  const [scenario, setScenario] = useState<'comparison' | 'drilldown'>('comparison');
  const [data, setData] = useState<OrderData[]>([]);
  const [metadata, setMetadata] = useState<AsinMetadata[]>([]);
  const [pbiData, setPBIData] = useState<PBIData[]>([]);
  const [error, setError] = useState<string>('');
  const [filesUploaded, setFilesUploaded] = useState({
    metadata: false,
    orders: false,
    pbi: false
  });

  const handleMetadataFileUpload = async (file: File) => {
    try {
      setError('');
      const processedMetadata = await processMetadataFile(file);
      setMetadata(processedMetadata);
      setFilesUploaded(prev => ({ ...prev, metadata: true }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process metadata file';
      setError(errorMessage);
      console.error('Error processing metadata file:', error);
    }
  };

  const handleOrderFileUpload = async (file: File) => {
    try {
      setError('');
      const processedData = await processFileData(file);
      setData(processedData);
      setFilesUploaded(prev => ({ ...prev, orders: true }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process order file';
      setError(errorMessage);
      console.error('Error processing file:', error);
    }
  };

  const handlePBIFileUpload = async (file: File) => {
    try {
      setError('');
      const processedPBIData = await processPBIData(file);
      setPBIData(processedPBIData);
      setFilesUploaded(prev => ({ ...prev, pbi: true }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process PBI file';
      setError(errorMessage);
      console.error('Error processing PBI file:', error);
    }
  };

  const handleRestart = () => {
    setData([]);
    setMetadata([]);
    setPBIData([]);
    setError('');
    setFilesUploaded({
      metadata: false,
      orders: false,
      pbi: false
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 relative">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col items-center">
          <ScenarioSelector
            scenario={scenario}
            onScenarioChange={setScenario}
          />
          <div className="w-full flex justify-end mb-4">
            <button
              onClick={handleRestart}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Reset Analysis
            </button>
          </div>
          <FileUpload
            onOrderFileUpload={handleOrderFileUpload}
            onMetadataFileUpload={handleMetadataFileUpload}
            onPBIFileUpload={handlePBIFileUpload}
            scenario={scenario}
            filesUploaded={filesUploaded}
          />
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
              {error}
            </div>
          )}
        </div>

        {scenario === 'comparison' && (
          <ComparisonView
            data={data}
            pbiData={pbiData}
            filesUploaded={{
              orders: filesUploaded.orders,
              pbi: filesUploaded.pbi
            }}
          />
        )}

        {scenario === 'drilldown' && (
          <DrilldownView
            metadata={metadata}
            pbiData={pbiData}
            filesUploaded={{
              metadata: filesUploaded.metadata,
              pbi: filesUploaded.pbi
            }}
          />
        )}
      </div>
      <footer className="text-center py-4 text-gray-600 absolute bottom-0 w-full">
        Built with ❤️ and lots of ☕ by Clau
      </footer>
    </div>
  );
}

export default App;