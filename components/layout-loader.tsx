import React from "react";

const LayoutLoader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50 z-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 border-4 border-t-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-gray-600 text-lg font-medium animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
};

export default LayoutLoader;




