// src/pages/AutomaticReports/hooks/useAutomaticReportData.ts
import { useState, useEffect, useCallback } from "react";
import { AutomaticReport } from "../../../models/AutomaticReport";
import { getAllAutomaticReports } from "../adapters/AutomaticReportAdapter";

export const useAutomaticReportData = () => {
  const [reports, setReports] = useState<AutomaticReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllAutomaticReports();
      setReports(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar los reportes automáticos."
      );
    } finally {
      setLoading(false);
    } // cierra finally
  }, []); // cierra const load

  useEffect(() => {
    load();
  }, [load]); // cierra useEffect

  return { reports, loading, error, reload: load };
}; // cierra export const useAutomaticReportData
