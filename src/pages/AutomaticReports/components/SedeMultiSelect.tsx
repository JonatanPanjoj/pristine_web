// src/pages/AutomaticReports/components/SedeMultiSelect.tsx
import React from "react";
import Select from "react-select";
import useEnabledSedesFromCache from "../../../components/sedesEnabled/hooks/useEnabledSedesFromCache";
import { reportSelectStyles } from "../../../components/reportSelectStyles";

export interface SedeOption {
  value: string; // ID Firestore de la sede
  label: string; // Nombre de la sede
}

interface SedeMultiSelectProps {
  allSedes: boolean;
  onAllSedesChange: (allSedes: boolean) => void;
  selectedSedes: SedeOption[];
  onSelectedSedesChange: (sedes: SedeOption[]) => void;
  isDisabled?: boolean;
}

// Por defecto aplica a todas las sedes; al desmarcar se habilita la selección
// múltiple de sedes específicas.
const SedeMultiSelect: React.FC<SedeMultiSelectProps> = ({
  allSedes,
  onAllSedesChange,
  selectedSedes,
  onSelectedSedesChange,
  isDisabled = false,
}) => {
  const { sedes, loading } = useEnabledSedesFromCache();

  const options: SedeOption[] = sedes.map((s) => ({
    value: s.id,
    label: s.name,
  }));

  return (
    <div className="space-y-2.5">
      <AllSedesToggle
        checked={allSedes}
        onChange={onAllSedesChange}
        isDisabled={isDisabled}
      />

      {!allSedes && (
        <Select<SedeOption, true>
          isMulti
          value={selectedSedes}
          onChange={(selected) => onSelectedSedesChange(selected as SedeOption[])}
          options={options}
          isLoading={loading}
          isDisabled={isDisabled}
          placeholder="Selecciona una o varias sedes…"
          noOptionsMessage={() => "Sin sedes disponibles"}
          closeMenuOnSelect={false}
          styles={reportSelectStyles}
        />
      )}
    </div>
  ); // cierra return
}; // cierra const SedeMultiSelect

interface AllSedesToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  isDisabled: boolean;
}

const AllSedesToggle: React.FC<AllSedesToggleProps> = ({
  checked,
  onChange,
  isDisabled,
}) => (
  <label
    className={`inline-flex items-center gap-2 text-xs font-semibold text-slate-600 ${
      isDisabled ? "opacity-60" : "cursor-pointer"
    }`}
  >
    <input
      type="checkbox"
      checked={checked}
      disabled={isDisabled}
      onChange={(e) => onChange(e.target.checked)}
      className="w-4 h-4 rounded accent-primary-gold cursor-pointer disabled:cursor-not-allowed"
    />
    Todas las sedes
  </label>
); // cierra const AllSedesToggle

export default SedeMultiSelect;
