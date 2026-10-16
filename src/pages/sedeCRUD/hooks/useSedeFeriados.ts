// src/pages/<sedeModule>/hooks/useSedeFeriados.ts
import { useState } from "react";
import { updateSedeFeriadosAdapter } from "../adapters/updateSedeFeriadosAdapter";
import { loadAndUpdateSedes } from "../../../services/sedeStorage";

export const useSedeFeriados = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveFeriados = async (id: string, fechas: string[]): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await updateSedeFeriadosAdapter(id, fechas);
      loadAndUpdateSedes();
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al guardar las fechas feriadas."
      );
      return false;
    } finally {
      setLoading(false);
    } // cierra finally
  }; // cierra const saveFeriados

  return { saveFeriados, loading, error };
}; // cierra export const useSedeFeriados