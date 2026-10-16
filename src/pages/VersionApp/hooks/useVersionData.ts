// src/pages/versionApp/hooks/useVersionData.ts
import { useState, useEffect, useCallback } from "react";
import { Version } from "../../../models/Version";
import { getAllVersions } from "../adapters/VersionAdapter";

export const useVersionData = () => {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllVersions();
      setVersions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar las versiones.");
    } finally {
      setLoading(false);
    } // cierra finally
  }, []); // cierra const load

  useEffect(() => {
    load();
  }, [load]); // cierra useEffect

  return { versions, loading, error, reload: load };
}; // cierra export const useVersionData
