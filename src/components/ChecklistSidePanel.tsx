import React, { useState } from 'react';
import { FiX, FiSave } from 'react-icons/fi';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChecklistFormData {
  name: string;
  category: string;
  requiresPhoto: boolean;
  requiresSignature: boolean;
}

interface ChecklistSidePanelProps {
  onClose: () => void;
  onSave: (data: ChecklistFormData) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const ChecklistSidePanel: React.FC<ChecklistSidePanelProps> = ({ onClose, onSave }) => {
  const [form, setForm] = useState<ChecklistFormData>({
    name: '',
    category: '',
    requiresPhoto: false,
    requiresSignature: false,
  });

  const handleChange = (field: keyof ChecklistFormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onSave(form);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-5 w-full">
      {/* ── Panel header ── */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Agregar Checklist</h2>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FiX size={18} />
        </button>
      </div>

      {/* ── Fields ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nombre / Título */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">
            Nombre o Título <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            placeholder="nombre"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder-gray-300 transition"
          />
        </div>

        {/* Categoría */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">
            Categoría <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            placeholder="instancias"
            value={form.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder-gray-300 transition"
          />
        </div>
      </div>

      {/* ── Toggles ── */}
      <div className="flex items-center gap-8">
        {/* Requiere foto */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleChange('requiresPhoto', !form.requiresPhoto)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${
              form.requiresPhoto ? 'bg-orange-500' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                form.requiresPhoto ? 'translate-x-4' : 'translate-x-1'
              }`}
            />
          </button>
          <span className="text-xs text-gray-600">¿Requiere foto?</span>
        </div>

        {/* Requiere firma */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleChange('requiresSignature', !form.requiresSignature)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${
              form.requiresSignature ? 'bg-orange-500' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                form.requiresSignature ? 'translate-x-4' : 'translate-x-1'
              }`}
            />
          </button>
          <span className="text-xs text-gray-600">¿Requiere firma?</span>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="flex justify-end gap-2 pt-1">
        <button
          onClick={onClose}
          className="px-5 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors"
        >
          Limpiar
        </button>
        <button
          onClick={handleSubmit}
          className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white transition-colors"
        >
          <FiSave size={14} />
          Guardar datos
        </button>
      </div>
    </div>
  );
};

export default ChecklistSidePanel;
