// src/pages/<sedeModule>/hooks/useSoftDeleteSede.ts
import { useState } from "react";
import { softDeleteSedeAdapter } from "../adapters/softDeleteSedeAdapter";

export const useSoftDeleteSede = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const softDelete = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await softDeleteSedeAdapter(id);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al desactivar la sede.");
      return false;
    } finally {
      setLoading(false);
    } // cierra finally
  }; // cierra const softDelete

  return { softDelete, loading, error };
}; // cierra export const useSoftDeleteSede
