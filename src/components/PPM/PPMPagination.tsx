import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface PPMPaginationProps {
  currentPage: number;
  totalPages: number;
  totalDocs: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

// Paginación circular dorada estándar del módulo PPM.
export const PPMPagination: React.FC<PPMPaginationProps> = ({
  currentPage,
  totalPages,
  totalDocs,
  pageSize,
  onPageChange
}) => {
  const firstRecord = totalDocs === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastRecord = Math.min(currentPage * pageSize, totalDocs);

  return (
    <div className="mt-6 flex items-center justify-between flex-shrink-0 flex-wrap gap-4 pt-4 border-t border-slate-100">
      <div className="text-xs font-semibold text-slate-500">
        {`${firstRecord}-${lastRecord} de ${totalDocs} resultados`}
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="w-8 h-8 rounded-full bg-primary-gold text-white flex items-center justify-center shadow-md hover:opacity-95 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          title="Página anterior"
        >
          <FiChevronLeft className="w-4 h-4 stroke-[2.5]" />
        </button>
        <div className="w-8 h-8 rounded-full bg-primary-gold text-white flex items-center justify-center font-bold text-xs shadow-md select-none">
          {currentPage}
        </div>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="w-8 h-8 rounded-full bg-primary-gold text-white flex items-center justify-center shadow-md hover:opacity-95 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          title="Página siguiente"
        >
          <FiChevronRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
