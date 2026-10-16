// components/PPM/PPMSearchSelect.tsx
// Selector buscable del módulo PPM sobre react-select, con los estilos dorados
// del sistema. Soporta selección simple y múltiple (técnicos de una OT).

import React from 'react';
import Select from 'react-select';

export interface PPMSelectOption {
  value: string;
  label: string;
  /** Texto secundario que se muestra bajo la etiqueta (código, serie, ubicación…). */
  description?: string;
}

interface CommonProps {
  label: string;
  placeholder?: string;
  options: PPMSelectOption[];
  isLoading?: boolean;
  isDisabled?: boolean;
  required?: boolean;
  emptyMessage?: string;
}

interface SingleProps extends CommonProps {
  isMulti?: false;
  value: string;
  onChange: (value: string) => void;
}

interface MultiProps extends CommonProps {
  isMulti: true;
  value: string[];
  onChange: (value: string[]) => void;
}

export const PPMSearchSelect: React.FC<SingleProps | MultiProps> = (props) => {
  const { label, placeholder, options, isLoading, isDisabled, required, emptyMessage } = props;

  const selected = props.isMulti
    ? options.filter((option) => props.value.includes(option.value))
    : options.find((option) => option.value === props.value) ?? null;

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
        {label} {required && '*'}
      </label>
      <Select
        isMulti={props.isMulti}
        styles={selectStyles}
        options={options}
        value={selected as any}
        isLoading={isLoading}
        isDisabled={isDisabled}
        isClearable={!props.isMulti}
        placeholder={placeholder ?? 'Buscar…'}
        noOptionsMessage={() => emptyMessage ?? 'Sin resultados'}
        formatOptionLabel={formatOption}
        closeMenuOnSelect={!props.isMulti}
        onChange={(option: any) => {
          if (props.isMulti) {
            props.onChange(((option ?? []) as PPMSelectOption[]).map((item) => item.value));
          } else {
            props.onChange(option?.value ?? '');
          }
        }}
      />
    </div>
  );
};

// La descripción solo se pinta en el desplegable: en el valor seleccionado
// ocuparía dos líneas y descuadraría el formulario.
const formatOption = (option: PPMSelectOption, meta: { context: string }) => (
  <div className="flex flex-col">
    <span>{option.label}</span>
    {option.description && meta.context === 'menu' && (
      <span className="text-[11px] text-slate-400">{option.description}</span>
    )}
  </div>
);

const selectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    borderRadius: '16px',
    borderColor: state.isFocused ? '#FCB521' : '#E2E8F0',
    boxShadow: state.isFocused ? '0 0 0 1px #FCB521' : 'none',
    '&:hover': { borderColor: '#FCB521' },
    fontSize: '13px',
    minHeight: '48px',
    backgroundColor: 'white',
    paddingLeft: '8px',
    paddingRight: '8px',
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected ? '#FCB521' : state.isFocused ? 'rgba(252, 181, 33, 0.15)' : 'transparent',
    color: state.isSelected ? 'white' : '#334155',
    fontSize: '13px',
  }),
  multiValue: (base: any) => ({
    ...base,
    backgroundColor: 'rgba(252, 181, 33, 0.15)',
    borderRadius: '9999px',
    paddingLeft: '4px',
  }),
  multiValueLabel: (base: any) => ({ ...base, color: '#A16207', fontWeight: 600, fontSize: '12px' }),
  multiValueRemove: (base: any) => ({
    ...base,
    borderRadius: '9999px',
    ':hover': { backgroundColor: '#FCB521', color: 'white' },
  }),
  placeholder: (base: any) => ({ ...base, color: '#94A3B8' }),
  menu: (base: any) => ({ ...base, zIndex: 60 }),
};

export default PPMSearchSelect;
