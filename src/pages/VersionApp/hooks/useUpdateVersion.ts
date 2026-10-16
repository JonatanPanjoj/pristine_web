// src/pages/versionApp/hooks/useUpdateVersion.ts
import { useState } from "react";
import { updateVersion } from "../adapters/VersionAdapter";
import { Version } from "../../../models/Version";

export const useUpdateVersion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateVersionById = async (
    id: string,
    version: Partial<Version>
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await updateVersion(id, version);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar la versión.");
      return false;
    } finally {
      setLoading(false);
    } // cierra finally
  }; // cierra const updateVersionById

  return { updateVersionById, loading, error };
}; // cierra export const useUpdateVersion
