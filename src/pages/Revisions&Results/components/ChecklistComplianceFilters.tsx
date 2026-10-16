// components/ChecklistComplianceFilters.tsx
// Panel de filtros colapsable con el mismo patrón que DashboardFilters de
// /checkList/dashboard: cabecera dorada plegable, react-select en píldora y
// botones Limpiar / Buscar. Incorpora además el periodo (Día / Semana / Mes),
// que es el que decide el rango consultado.

import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { FiFilter, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import useEnabledSedesForUser from '../../../components/sedesEnabled/hooks/useEnabledSedesForUser';
import { fetchSectorsBySedeIds } from '../../../components/sectorAll/hooks/fetchSectorsBySedeIds';
import useFetchCategorias from '../../CategoryChecklistCrud/hooks/useFetchCategorias';
import { parseDateInput, toDateInputValue, PeriodKey } from '../utils/dateRange';
import { Sector } from '../../../models/Sector';

export interface ComplianceFilterValues {
  sedeId: string;
  sectorId: string;
  categoryId: string;
  period: PeriodKey;
  anchorDate: Date;
}

interface ChecklistComplianceFiltersProps {
  values: ComplianceFilterValues;
  onChange: (values: ComplianceFilterValues) => void;
  onSearch: (values: ComplianceFilterValues) => void;
  onReset: () => void;
}

const PERIOD_OPTIONS: { value: PeriodKey; label: string }[] = [
  { value: 'day', label: 'Día' },
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mes' },
];

/** Sede vacía = todas. Se ofrece como una opción más para que se vea que existe. */
const TODAS_LAS_SEDES = { value: '', label: 'Todas las sedes' };

const DATE_INPUT_CLS =
  'w-full text-xs text-slate-700 border border-slate-200 rounded-full px-3 py-1.5 focus:outline-none focus:border-primary-gold focus:ring-1 focus:ring-primary-gold';

export const ChecklistComplianceFilters: React.FC<ChecklistComplianceFiltersProps> = ({
  values,
  onChange,
  onSearch,
  onReset,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loadingSectors, setLoadingSectors] = useState(false);

  const { sedes, loading: loadingSedes } = useEnabledSedesForUser();
  const { categorias, loading: loadingCategories } = useFetchCategorias();

  useEffect(() => {
    if (!values.sedeId) {
      setSectors([]);
      return;
    }
    setLoadingSectors(true);
    fetchSectorsBySedeIds({ sedeIds: [values.sedeId] })
      .then(setSectors)
      .finally(() => setLoadingSectors(false));
  }, [values.sedeId]);

  const patch = (changes: Partial<ComplianceFilterValues>) => onChange({ ...values, ...changes });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSearch(values);
  };

  return (
    <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] border-0 flex flex-col">
      {/* Botón de cabecera colapsable */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full bg-primary-gold px-6 py-4 font-bold text-white text-[14px] flex items-center justify-between transition-all focus:outline-none hover:opacity-95 ${
          isExpanded ? 'rounded-t-[32px]' : 'rounded-[32px]'
        }`}
      >
        <div className="flex items-center gap-2">
          <FiFilter className="w-4 h-4" />
          <span>Filtros de búsqueda de cumplimiento (Opcionales)</span>
        </div>
        {isExpanded ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
      </button>

      {/* Panel colapsable */}
      {isExpanded && (
        <form onSubmit={handleSubmit} className="p-5 space-y-4 border-t border-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <FilterField label="Sede">
              <Select
                placeholder="Seleccione una sede"
                styles={selectStyles}
                isLoading={loadingSedes}
                options={[TODAS_LAS_SEDES, ...sedes.map((s) => ({ value: s.id, label: s.name }))]}
                value={
                  values.sedeId
                    ? toOption(values.sedeId, sedes.find((s) => s.id === values.sedeId)?.name)
                    : TODAS_LAS_SEDES
                }
                onChange={(opt) => patch({ sedeId: opt?.value ?? '', sectorId: '' })}
              />
            </FilterField>

            <FilterField label="Sector">
              <Select
                placeholder="Todos los sectores"
                styles={selectStyles}
                isClearable
                isLoading={loadingSectors}
                isDisabled={!values.sedeId}
                options={sectors.map((s) => ({ value: s.id, label: s.name }))}
                value={toOption(values.sectorId, sectors.find((s) => s.id === values.sectorId)?.name)}
                onChange={(opt) => patch({ sectorId: opt?.value ?? '' })}
              />
            </FilterField>

            <FilterField label="Categoría">
              <Select
                placeholder="Todas las categorías"
                styles={selectStyles}
                isClearable
                isLoading={loadingCategories}
                options={categorias.map((c) => ({ value: c.id, label: c.name }))}
                value={toOption(values.categoryId, categorias.find((c) => c.id === values.categoryId)?.name)}
                onChange={(opt) => patch({ categoryId: opt?.value ?? '' })}
              />
            </FilterField>

            <FilterField label="Periodo">
              <Select
                placeholder="Periodo"
                styles={selectStyles}
                options={PERIOD_OPTIONS}
                value={PERIOD_OPTIONS.find((option) => option.value === values.period) ?? null}
                onChange={(opt) => patch({ period: (opt?.value ?? 'day') as PeriodKey })}
              />
            </FilterField>

            <FilterField label={values.period === 'day' ? 'Fecha' : 'Fecha de referencia'}>
              <input
                type="date"
                value={toDateInputValue(values.anchorDate)}
                onChange={(e) => patch({ anchorDate: parseDateInput(e.target.value) })}
                className={DATE_INPUT_CLS}
              />
            </FilterField>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onReset}
              className="px-6 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full transition-all active:scale-95 text-center"
            >
              Limpiar
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-xs font-bold text-white bg-primary-gold hover:opacity-90 rounded-full transition-all active:scale-95 text-center shadow-[0_4px_12px_rgba(221,152,3,0.15)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Buscar
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

const FilterField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">{label}</label>
    {children}
  </div>
);

const toOption = (value: string, label?: string) => (value ? { value, label: label ?? value } : null);

// Mismos estilos de react-select que DashboardFilters.
const selectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    borderRadius: '9999px',
    borderColor: state.isFocused ? '#FCB521' : '#E2E8F0',
    boxShadow: state.isFocused ? '0 0 0 1px #FCB521' : 'none',
    '&:hover': { borderColor: '#FCB521' },
    fontSize: '12px',
    minHeight: '36px',
    backgroundColor: 'white',
    paddingLeft: '8px',
    paddingRight: '8px',
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected ? '#FCB521' : state.isFocused ? 'rgba(252, 181, 33, 0.15)' : 'transparent',
    color: state.isSelected ? 'white' : '#334155',
    '&:hover': { backgroundColor: '#FCB521', color: 'white' },
    fontSize: '12px',
  }),
  placeholder: (base: any) => ({ ...base, color: '#94A3B8' }),
  menu: (base: any) => ({ ...base, zIndex: 50 }),
};

export default ChecklistComplianceFilters;
