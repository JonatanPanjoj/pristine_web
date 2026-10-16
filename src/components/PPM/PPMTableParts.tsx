import React from 'react';

// Clases de celda del estándar pildórico (view-design-standards).
export const PPM_CELL_CLASS =
  'py-3 px-4 bg-[#FAFAFA] first:rounded-l-full last:rounded-r-full';

const HEAD_CELL_CLASS =
  'py-3 px-4 bg-primary-gold first:rounded-l-full last:rounded-r-full select-none';

interface PPMTableHeadProps {
  columns: string[];
}

export const PPMTableHead: React.FC<PPMTableHeadProps> = ({ columns }) => (
  <thead>
    <tr className="text-white text-xs font-bold uppercase tracking-wider">
      {columns.map((column) => (
        <th key={column} className={HEAD_CELL_CLASS}>
          {column}
        </th>
      ))}
    </tr>
  </thead>
);

interface PPMEmptyRowProps {
  columnCount: number;
  message: string;
}

export const PPMEmptyRow: React.FC<PPMEmptyRowProps> = ({ columnCount, message }) => (
  <tr>
    <td colSpan={columnCount} className="py-12 px-4 bg-[#FAFAFA] text-center text-slate-400 rounded-full">
      {message}
    </td>
  </tr>
);
