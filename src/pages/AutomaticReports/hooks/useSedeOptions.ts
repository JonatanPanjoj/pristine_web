// src/pages/AutomaticReports/hooks/useSedeOptions.ts
import useEnabledSedesFromCache from "../../../components/sedesEnabled/hooks/useEnabledSedesFromCache";
import { SedeOption } from "../components/SedeMultiSelect";

// Expone las sedes habilitadas ya normalizadas como opciones de selector y una
// función para resolver los IDs guardados en un reporte a sus nombres.
export const useSedeOptions = () => {
  const { sedes, loading } = useEnabledSedesFromCache();

  const options: SedeOption[] = sedes.map((s) => ({ value: s.id, label: s.name }));

  const toOptions = (ids: string[]): SedeOption[] =>
    ids.map((id) => options.find((o) => o.value === id) ?? { value: id, label: id });

  const toNames = (ids: string[]): string[] => toOptions(ids).map((o) => o.label);

  return { options, loading, toOptions, toNames };
}; // cierra export const useSedeOptions
