import React from 'react';
import { useTranslation } from 'react-i18next';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const { t } = useTranslation(); // Hook para obtener la función de traducción

  return (
    <div className="flex items-center justify-center space-x-4 my-4">
      {/* Botón para ir a la página anterior */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || totalPages === 0}
        className={`px-4 py-2 rounded-full border border-gray-300 ${
          currentPage === 1 || totalPages === 0
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-orange-500 hover:text-orange-600 hover:border-orange-500 cursor-pointer'
        }`}
      >
        {t('pagination.previous')} {/* Traducción para "Anterior" */}
      </button>

      {/* Mostrar el estado actual de las páginas */}
      <span className="text-gray-500">
        {currentPage} {t('pagination.of')} {totalPages} {/* Traducción para "de" */}
      </span>

      {/* Botón para ir a la página siguiente */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || totalPages === 0}
        className={`px-4 py-2 rounded-full border border-gray-300 ${
          currentPage === totalPages || totalPages === 0
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-orange-500 hover:text-orange-600 hover:border-orange-500 cursor-pointer'
        }`}
      >
        {t('pagination.next')} {/* Traducción para "Siguiente" */}
      </button>
    </div>
  );
};

export default Pagination;
