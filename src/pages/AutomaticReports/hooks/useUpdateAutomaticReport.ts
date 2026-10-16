// src/pages/AutomaticReports/hooks/useUpdateAutomaticReport.ts
import { useState } from "react";
import { updateAutomaticReport } from "../adapters/AutomaticReportAdapter";
import { AutomaticReport } from "../../../models/AutomaticReport";

export const useUpdateAutomaticReport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateAutomaticReportById = async (
    id: string,
    report: Partial<AutomaticReport>
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await updateAutomaticReport(id, report);
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar el reporte automático."
      );
      return false;
    } finally {
      setLoading(false);
    } // cierra finally
  }; // cierra const updateAutomaticReportById

  return { updateAutomaticReportById, loading, error };
}; // cierra export const useUpdateAutomaticReport
