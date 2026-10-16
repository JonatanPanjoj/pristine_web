// src/pages/versionApp/hooks/useDeleteVersion.ts
import { useState } from "react";
import { deleteVersion } from "../adapters/VersionAdapter";

export const useDeleteVersion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const removeVersion = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await deleteVersion(id);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar la versión.");
      return false;
    } finally {
      setLoading(false);
    } // cierra finally
  }; // cierra const removeVersion

  return { removeVersion, loading, error };
}; // cierra export const useDeleteVersion
