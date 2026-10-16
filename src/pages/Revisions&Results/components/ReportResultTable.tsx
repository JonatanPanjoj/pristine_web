// ReportResultTable.tsx
// Tabla presentacional de resultados en estilo premium de filas píldora, usada
// por la vista standalone del resultado (pestaña nueva). Recibe una matriz
// normalizada (headers / rows / footer opcional) — es agnóstica del reporte.

import React from 'react';
import { FiTable } from 'react-icons/fi';

interface ReportResultTableProps {
  headers: string[];
  rows: (string | number)[][];
  footer?: (string | number)[];
  // Permite pintar una celda concreta a medida (p. ej. la miniatura de una foto).
  // Si devuelve undefined se usa el render por defecto.
  renderCell?: (value: string | number, rowIndex: number, colIndex: number) => React.ReactNode;
}

const ReportResultTable: React.FC<ReportResultTableProps> = ({ headers, rows, footer, renderCell }) => {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 text-slate-400 py-20 min-h-[240px]">
        <FiTable className="w-10 h-10 text-slate-200" />
        <p className="text-sm font-medium">No hay resultados disponibles</p>
      </div>
    );
  }

  const cellCls = 'bg-[#FAFAFA] py-2 px-4 text-[13px] text-slate-700 group-hover:bg-white transition-colors whitespace-nowrap';

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-y-3 border-spacing-x-0 text-center">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th
                key={`${h}-${i}`}
                className="bg-primary-gold text-white font-bold text-xs uppercase tracking-wider py-2 px-4 first:rounded-l-full last:rounded-r-full whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rIdx) => (
            <tr key={rIdx} className="group">
              {row.map((cell, cIdx) => {
                const custom = renderCell?.(cell, rIdx, cIdx);
                return (
                  <td
                    key={cIdx}
                    className={`${cellCls} ${cIdx === 0 ? 'first:rounded-l-full' : ''} ${cIdx === row.length - 1 ? 'last:rounded-r-full' : ''}`}
                  >
                    {custom !== undefined ? custom : <CellValue value={cell} />}
                  </td>
                );
              })}
            </tr>
          ))}
          {footer && (
            <tr>
              {footer.map((cell, i) => (
                <td
                  key={i}
                  className={`bg-primary-gold/10 text-slate-800 font-bold py-2 px-4 text-[13px] whitespace-nowrap ${i === 0 ? 'rounded-l-full' : ''} ${i === footer.length - 1 ? 'rounded-r-full' : ''}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// Las URLs se muestran como enlace en vez de volcar la cadena completa, que
// desbordaría la fila (por ejemplo, las fotos de las revisiones).
const CellValue: React.FC<{ value: string | number }> = ({ value }) => {
  if (typeof value !== 'string' || !/^https?:\/\//.test(value)) {
    return <>{value}</>;
  }

  return (
    <a
      href={value}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary-gold font-semibold hover:underline"
    >
      Ver archivo
    </a>
  );
};

export default ReportResultTable;
