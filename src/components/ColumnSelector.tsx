// components/ColumnSelector.tsx
// Selector de columnas genérico de doble lista (disponibles ↔ seleccionadas) con
// cabecera dorada, búsqueda, flechas de traspaso y reordenamiento por drag&drop.
// Agnóstico del reporte: opera sobre ColumnOption[] { key, label }. Reutilizado
// por los reportes de Help Desk y de Checklist.

import React, { useState } from "react";
import { FiChevronRight, FiChevronsRight, FiChevronLeft, FiChevronsLeft } from "react-icons/fi";

export interface ColumnOption {
  key: string;
  label: string;
}

interface ColumnSelectorProps {
  available: ColumnOption[];
  selected: ColumnOption[];
  onChange: (available: ColumnOption[], selected: ColumnOption[]) => void;
}

export const ColumnSelector: React.FC<ColumnSelectorProps> = ({ available, selected, onChange }) => {
  const [searchAvailable, setSearchAvailable] = useState("");
  const [searchSelected, setSearchSelected] = useState("");

  const [checkedAvailable, setCheckedAvailable] = useState<string[]>([]);
  const [checkedSelected, setCheckedSelected] = useState<string[]>([]);

  // Para el drag and drop nativo
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const filteredAvailable = available.filter((c) =>
    c.label.toLowerCase().includes(searchAvailable.toLowerCase())
  );
  const filteredSelected = selected.filter((c) =>
    c.label.toLowerCase().includes(searchSelected.toLowerCase())
  );

  const toggleAvailableChecked = (key: string) => {
    setCheckedAvailable((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const toggleSelectedChecked = (key: string) => {
    setCheckedSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const moveSelectedToRight = () => {
    const toMove = available.filter((c) => checkedAvailable.includes(c.key));
    const remain = available.filter((c) => !checkedAvailable.includes(c.key));
    onChange(remain, [...selected, ...toMove]);
    setCheckedAvailable([]);
  };

  const moveAllToRight = () => {
    onChange([], [...selected, ...available]);
    setCheckedAvailable([]);
  };

  const moveSelectedToLeft = () => {
    const toMove = selected.filter((c) => checkedSelected.includes(c.key));
    const remain = selected.filter((c) => !checkedSelected.includes(c.key));
    onChange([...available, ...toMove], remain);
    setCheckedSelected([]);
  };

  const moveAllToLeft = () => {
    onChange([...available, ...selected], []);
    setCheckedSelected([]);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      onChange([], [...selected, ...available]);
    } else {
      onChange([...available, ...selected], []);
    }
  };

  const handleClearSelection = () => {
    onChange([...available, ...selected], []);
    setCheckedAvailable([]);
    setCheckedSelected([]);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const listCopy = [...selected];
    const [draggedItem] = listCopy.splice(draggedIndex, 1);
    listCopy.splice(targetIndex, 0, draggedItem);

    onChange(available, listCopy);
    setDraggedIndex(null);
  };

  return (
    <div className="bg-white border border-neutral-100 rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col h-full overflow-hidden">
      {/* Header dorado */}
      <div className="bg-primary-gold px-6 py-5 font-bold text-white text-[15px] flex items-center justify-between flex-shrink-0">
        Seleccionar columnas del reporte
      </div>

      <div className="p-5 flex-1 flex flex-col min-h-0">
        {/* Barra superior de acciones */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 flex-shrink-0">
          <label className="flex items-center gap-2 text-xs font-semibold text-neutral-700 cursor-pointer select-none">
            <input
              type="checkbox"
              onChange={handleSelectAll}
              checked={available.length === 0 && selected.length > 0}
              className="w-4 h-4 rounded accent-primary-gold border-neutral-300 focus:ring-primary-gold"
            />
            Seleccionar todas
          </label>
          <button
            type="button"
            onClick={handleClearSelection}
            className="px-6 py-2 text-xs font-bold text-white bg-primary-gold rounded-full hover:opacity-95 transition-all active:scale-95 shadow-[0_4px_12px_rgba(221,152,3,0.25)]"
          >
            Limpiar selección
          </button>
        </div>

        {/* Dual List Container */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-7 gap-4 pt-4 min-h-0">
          {/* Disponibles (Columna Izquierda) */}
          <div className="md:col-span-3 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-neutral-800">{available.length} disponibles</span>
            </div>
            <input
              type="text"
              placeholder="Buscar..."
              value={searchAvailable}
              onChange={(e) => setSearchAvailable(e.target.value)}
              className="w-full text-xs text-neutral-800 border-0 bg-slate-100 rounded-full px-4 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-primary-gold/40 font-semibold"
            />
            <div className="flex-1 border border-slate-100 rounded-2xl overflow-y-auto p-3 bg-slate-50/40 scrollbar-custom min-h-[180px]">
              {filteredAvailable.map((col) => (
                <label
                  key={col.key}
                  className="flex items-center gap-2 p-1.5 rounded hover:bg-neutral-200/50 cursor-pointer transition-colors text-xs text-neutral-700"
                >
                  <input
                    type="checkbox"
                    checked={checkedAvailable.includes(col.key)}
                    onChange={() => toggleAvailableChecked(col.key)}
                    className="w-3.5 h-3.5 rounded accent-primary-gold border-neutral-300 focus:ring-primary-gold"
                  />
                  {col.label}
                </label>
              ))}
              {filteredAvailable.length === 0 && (
                <div className="text-center text-[11px] text-neutral-400 py-8 italic">No hay columnas</div>
              )}
            </div>
          </div>

          {/* Botones de control (Columna Central) */}
          <div className="flex md:flex-col items-center justify-center gap-2 md:col-span-1 flex-shrink-0">
            <button
              type="button"
              onClick={moveSelectedToRight}
              disabled={checkedAvailable.length === 0}
              className="p-2 rounded-full bg-primary-gold hover:opacity-95 text-white disabled:opacity-40 shadow-[0_4px_10px_rgba(221,152,3,0.2)] transition-all active:scale-95"
              title="Mover seleccionados"
            >
              <FiChevronRight className="w-4 h-4 md:rotate-0 rotate-90" />
            </button>
            <button
              type="button"
              onClick={moveAllToRight}
              disabled={available.length === 0}
              className="p-2 rounded-full bg-primary-gold hover:opacity-95 text-white disabled:opacity-40 shadow-[0_4px_10px_rgba(221,152,3,0.2)] transition-all active:scale-95"
              title="Mover todos"
            >
              <FiChevronsRight className="w-4 h-4 md:rotate-0 rotate-90" />
            </button>
            <button
              type="button"
              onClick={moveAllToLeft}
              disabled={selected.length === 0}
              className="p-2 rounded-full bg-primary-gold hover:opacity-95 text-white disabled:opacity-40 shadow-[0_4px_10px_rgba(221,152,3,0.2)] transition-all active:scale-95"
              title="Remover todos"
            >
              <FiChevronsLeft className="w-4 h-4 md:rotate-0 rotate-90" />
            </button>
            <button
              type="button"
              onClick={moveSelectedToLeft}
              disabled={checkedSelected.length === 0}
              className="p-2 rounded-full bg-primary-gold hover:opacity-95 text-white disabled:opacity-40 shadow-[0_4px_10px_rgba(221,152,3,0.2)] transition-all active:scale-95"
              title="Remover seleccionados"
            >
              <FiChevronLeft className="w-4 h-4 md:rotate-0 rotate-90" />
            </button>
          </div>

          {/* Seleccionados (Columna Derecha) */}
          <div className="md:col-span-3 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-neutral-800">{selected.length} seleccionados</span>
            </div>
            <input
              type="text"
              placeholder="Buscar..."
              value={searchSelected}
              onChange={(e) => setSearchSelected(e.target.value)}
              className="w-full text-xs text-neutral-800 border-0 bg-slate-100 rounded-full px-4 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-primary-gold/40 font-semibold"
            />
            <div className="flex-1 border border-slate-100 rounded-2xl overflow-y-auto p-3 bg-slate-50/40 scrollbar-custom min-h-[180px]">
              {filteredSelected.map((col, index) => (
                <div
                  key={col.key}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`flex items-center justify-between p-1.5 rounded border border-transparent hover:border-neutral-200 hover:bg-neutral-100 cursor-grab active:cursor-grabbing transition-all text-xs text-neutral-700 select-none ${
                    draggedIndex === index ? "bg-neutral-200 opacity-50" : ""
                  }`}
                >
                  <label className="flex items-center gap-2 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={checkedSelected.includes(col.key)}
                      onChange={() => toggleSelectedChecked(col.key)}
                      className="w-3.5 h-3.5 rounded accent-primary-gold border-neutral-300 focus:ring-primary-gold"
                    />
                    {col.label}
                  </label>
                  <span className="text-neutral-400 text-sm select-none" title="Arrastrar para reordenar">⋮⋮</span>
                </div>
              ))}
              {filteredSelected.length === 0 && (
                <div className="text-center text-[11px] text-neutral-400 py-8 italic">Ninguna columna seleccionada</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColumnSelector;
