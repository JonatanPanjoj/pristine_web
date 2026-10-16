import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="w-4 h-4 border-2 border-t-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-gray-500">Cargando...</span>
    </div>
  );
};

export default Loader;
