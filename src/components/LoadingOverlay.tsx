import React from 'react';

export const LoadingOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#64D7BE] mx-auto mb-4"></div>
        <p className="text-xl font-semibold text-gray-800">
          Cooking the numbers... 👨‍🍳
        </p>
      </div>
    </div>
  );
};