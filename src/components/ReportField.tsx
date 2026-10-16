// components/ReportField.tsx
// Campos de filtro compartidos por los reportes: select con etiqueta (react-select
// estilo píldora dorada) e input de fecha en píldora. Centralizan el markup para
// no repetirlo en cada reporte.

import React from "react";
import Select from "react-select";
import { reportSelectStyles } from "./reportSelectStyles";

export interface SelectOption {
  value: string;
  label: string;
}

export const ReportSelect: React.FC<{
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
}> = ({ label, options, value, onChange, placeholder = "Seleccionar", isLoading, isDisabled }) => (
  <div>
    <label className="block text-xs font-semibold text-neutral-700 mb-1">{label}</label>
    <Select
      placeholder={placeholder}
      styles={reportSelectStyles}
      isClearable
      options={options}
      isLoading={isLoading}
      isDisabled={isDisabled}
      // Portal a <body>: dentro de la tarjeta el menú queda recortado.
      menuPortalTarget={document.body}
      menuPosition="fixed"
      value={options.find((o) => o.value === value) || null}
      onChange={(opt: any) => onChange(opt ? opt.value : "")}
    />
  </div>
);

export const ReportDate: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => (
  <input
    type="date"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full text-xs text-neutral-800 border-0 bg-slate-100 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-gold/40 font-semibold"
  />
);
