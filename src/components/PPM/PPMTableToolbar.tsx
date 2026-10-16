import React from 'react';
import { FiChevronDown, FiSearch } from 'react-icons/fi';

const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

interface PPMTableToolbarProps {
  pageSize: number;
  onPageSizeChange: (pageSize: number) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  searchPlaceholder: string;
  pageSizeOptions?: number[];
}

// Fila superior estándar de las tablas PPM: limitador de registros + buscador píldora.
export const PPMTableToolbar: React.FC<PPMTableToolbarProps> = ({
  pageSize,
  onPageSizeChange,
  searchTerm,
  onSearchChange,
  searchPlaceholder,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 mt-1 flex-shrink-0">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
        <span>Mostrar:</span>
        <div className="relative">
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="appearance-none bg-primary-dark text-white font-bold px-4 py-1.5 pr-8 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-primary-dark/40 shadow-sm cursor-pointer text-xs"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option} className="text-slate-800 font-semibold bg-white">
                {option}
              </option>
            ))}
          </select>
          <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white pointer-events-none w-3.5 h-3.5" />
        </div>
        <span>resultados por página</span>
      </div>

      <div className="relative w-full sm:w-64">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 cursor-pointer" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-slate-100/80 border-0 rounded-full pl-10 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-gold/40 transition-all font-semibold"
        />
      </div>
    </div>
  );
};
