// src/pages/versionApp/hooks/useCreateVersion.ts
import { useState } from "react";
import { createVersion } from "../adapters/VersionAdapter";
import { Version } from "../../../models/Version";

const useCreateVersion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateVersion = async (versionData: Version) => {
    setLoading(true);
    setError(null);
    try {
      const id = await createVersion(versionData);
      return { success: true, message: "Versión creada con éxito.", id };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al crear la versión.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    } // cierra finally
  }; // cierra const handleCreateVersion

  return { handleCreateVersion, loading, error };
}; // cierra const useCreateVersion

export default useCreateVersion;
