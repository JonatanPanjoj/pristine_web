// src/pages/AutomaticReports/hooks/useDeleteAutomaticReport.ts
import { useState } from "react";
import { deleteAutomaticReport } from "../adapters/AutomaticReportAdapter";

export const useDeleteAutomaticReport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const removeAutomaticReport = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await deleteAutomaticReport(id);
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar el reporte automático."
      );
      return false;
    } finally {
      setLoading(false);
    } // cierra finally
  }; // cierra const removeAutomaticReport

  return { removeAutomaticReport, loading, error };
}; // cierra export const useDeleteAutomaticReport
