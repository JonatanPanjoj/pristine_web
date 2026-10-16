// components/ReportPreview.tsx
// Previsualización de documento genérica con vista Excel / PDF simulada. Agnóstica
// del reporte: recibe title/subtitle, filas (Record<string, any>) y las columnas
// seleccionadas (ColumnOption[]). Reutilizada por los reportes de Help Desk y de
// Checklist.

import React, { useState } from "react";
import { FiEye } from "react-icons/fi";
import { ColumnOption } from "./ColumnSelector";

interface ReportPreviewProps {
  title: string;
  subtitle?: string;
  results: Record<string, any>[];
  selectedColumns: ColumnOption[];
  loading: boolean;
  // Permite a un reporte concreto pintar una celda a su manera (por ejemplo, una
  // miniatura clicable). Si devuelve undefined se usa el render por defecto.
  renderCell?: (row: Record<string, any>, column: ColumnOption) => React.ReactNode;
}

export const ReportPreview: React.FC<ReportPreviewProps> = ({ title, subtitle, results, selectedColumns, loading, renderCell }) => {
  const [previewMode, setPreviewMode] = useState<"excel" | "pdf">("excel");

  if (loading) {
    return (
      <div className="bg-white border border-neutral-100 rounded-[32px] p-8 flex items-center justify-center min-h-[300px] shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-primary-gold/20 border-t-primary-gold rounded-full animate-spin mb-3" />
          <p className="text-xs text-neutral-500 font-medium">Cargando previsualización...</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="bg-white border border-neutral-100 rounded-[32px] p-8 flex flex-col items-center justify-center text-center min-h-[250px] shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
        <FiEye className="w-8 h-8 text-neutral-400 mb-2" />
        <p className="text-xs font-semibold text-neutral-600">Previsualización de documento no disponible</p>
        <p className="text-[11px] text-neutral-400 mt-1">Realice una búsqueda para generar la vista previa del reporte.</p>
      </div>
    );
  }

  const previewRows = results.slice(0, 6);
  const cell = (row: Record<string, any>, column: ColumnOption): React.ReactNode => {
    const custom = renderCell?.(row, column);
    if (custom !== undefined) return custom;

    const v = row[column.key];
    if (column.key === "photos" || Array.isArray(v)) {
      const photosArr = Array.isArray(v) ? v : row.photos;
      if (Array.isArray(photosArr) && photosArr.length > 0) {
        return `📷 ${photosArr.length} foto(s)`;
      }
      return "Sin fotos";
    }
    return v === null || v === undefined || v === "" ? "—" : String(v);
  };

  return (
    <div className="space-y-4">
      {/* Cabecera de la Previsualización */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <FiEye className="w-4 h-4 text-primary-gold" />
          Previsualización de documento
        </h3>

        {/* Toggle Excel / PDF */}
        <div className="bg-slate-100 p-1.5 rounded-full flex gap-2">
          <button
            type="button"
            onClick={() => setPreviewMode("excel")}
            className={`px-6 py-2 text-xs font-bold rounded-full transition-all active:scale-95 ${
              previewMode === "excel" ? "bg-white text-primary-gold shadow-sm" : "text-slate-500 hover:text-slate-700 bg-transparent"
            }`}
          >
            Vista Excel
          </button>
          <button
            type="button"
            onClick={() => setPreviewMode("pdf")}
            className={`px-6 py-2 text-xs font-bold rounded-full transition-all active:scale-95 ${
              previewMode === "pdf" ? "bg-white text-primary-gold shadow-sm" : "text-slate-500 hover:text-slate-700 bg-transparent"
            }`}
          >
            Vista PDF
          </button>
        </div>
      </div>

      {/* Contenedor del Preview */}
      <div className="border border-slate-100 rounded-[32px] bg-slate-50 p-6 overflow-x-auto min-h-[350px] flex justify-center items-start shadow-inner scrollbar-custom">
        {previewMode === "excel" ? (
          /* MOCKUP EXCEL */
          <div className="bg-white border border-neutral-300 shadow-lg w-full max-w-4xl text-[11px] font-sans text-neutral-800 overflow-hidden rounded-md">
            <div className="bg-neutral-100 border-b border-neutral-200 px-3 py-1.5 font-semibold text-neutral-500 flex items-center select-none">
              Libro1 - Excel
            </div>

            <div className="flex">
              <div className="w-8 bg-neutral-100 border-r border-neutral-300 select-none flex-shrink-0 text-center text-neutral-400 font-semibold pt-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <div key={n} className="h-6 flex items-center justify-center border-b border-neutral-200">{n}</div>
                ))}
              </div>

              <div className="flex-1 overflow-x-auto">
                <div className="flex h-6 bg-neutral-100 border-b border-neutral-300 font-semibold text-neutral-400 select-none">
                  {["A", "B", "C", "D", "E", "F", "G", "H"].slice(0, Math.max(selectedColumns.length, 3)).map((letter, idx) => (
                    <div key={idx} className="w-40 border-r border-neutral-200 flex items-center justify-center flex-shrink-0">{letter}</div>
                  ))}
                </div>

                <div className="flex h-6 border-b border-neutral-200 font-bold bg-[#FCB521] text-white items-center justify-center text-xs">
                  {title}
                </div>

                <div className="flex h-6 border-b border-neutral-200 bg-white items-center justify-center italic text-neutral-500 text-[10px]">
                  Generado: {new Date().toLocaleString("es-GT")}
                </div>

                <div className="flex h-6 border-b border-neutral-200 bg-white"></div>

                <div className="flex h-6 border-b border-neutral-300 bg-[#2D3C49] text-white font-bold">
                  {selectedColumns.map((col) => (
                    <div key={col.key} className="w-40 border-r border-neutral-300 px-2 flex items-center justify-center text-[10px] uppercase tracking-wider flex-shrink-0">
                      {col.label}
                    </div>
                  ))}
                </div>

                {previewRows.map((row, idx) => (
                  <div key={idx} className="flex h-6 border-b border-neutral-200 hover:bg-neutral-50 bg-white">
                    {selectedColumns.map((col) => (
                      <div key={col.key} className="w-40 border-r border-neutral-200 px-2 flex items-center truncate text-neutral-600 flex-shrink-0">
                        {cell(row, col)}
                      </div>
                    ))}
                  </div>
                ))}

                {Array.from({ length: Math.max(0, 4 - previewRows.length) }).map((_, idx) => (
                  <div key={idx} className="flex h-6 border-b border-neutral-200 bg-white">
                    {selectedColumns.map((col) => (
                      <div key={col.key} className="w-40 border-r border-neutral-200 flex-shrink-0"></div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* MOCKUP PDF */
          <div className="bg-white border border-neutral-300 shadow-xl w-full max-w-4xl text-[10px] font-serif text-neutral-800 p-8 rounded-md relative min-h-[300px]">
            <div className="border-b border-neutral-200 pb-4 mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-base font-bold text-[#2D3C49]">{title}</h2>
                  {subtitle && <p className="text-[9px] text-[#7693A7] mt-0.5">{subtitle}</p>}
                </div>
                <div className="text-right text-[8px] text-neutral-400">
                  <p>Generado: {new Date().toLocaleString("es-GT")}</p>
                  <p>Página 1 de 1</p>
                </div>
              </div>
            </div>

            <table className="w-full text-left border-collapse border border-neutral-200">
              <thead>
                <tr className="bg-[#FCB521] text-white font-bold">
                  {selectedColumns.map((col) => (
                    <th key={col.key} className="px-2 py-1.5 border border-neutral-200 text-[9px] font-semibold">{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-neutral-50 odd:bg-white even:bg-neutral-50/50">
                    {selectedColumns.map((col) => (
                      <td key={col.key} className="px-2 py-1.5 border border-neutral-200 text-neutral-600 text-[8px] font-sans">
                        {cell(row, col)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-8 pt-4 border-t border-neutral-100 flex justify-between items-center text-[7px] text-neutral-400">
              <p>Módulo de reportes automatizados de Pristine</p>
              <p className="italic">Confidencial</p>
            </div>
          </div>
        )}
      </div>

      {results.length > 6 && (
        <p className="text-[10px] text-neutral-400 italic text-right pr-2">
          * Mostrando las primeras 6 filas de previsualización. Las descargas contendrán todos los {results.length} resultados.
        </p>
      )}
    </div>
  );
};

export default ReportPreview;
