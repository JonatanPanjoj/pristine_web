// src/pages/AutomaticReports/hooks/useCreateAutomaticReport.ts
import { useState } from "react";
import { createAutomaticReport } from "../adapters/AutomaticReportAdapter";
import { AutomaticReport } from "../../../models/AutomaticReport";

const useCreateAutomaticReport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateAutomaticReport = async (reportData: AutomaticReport) => {
    setLoading(true);
    setError(null);
    try {
      const id = await createAutomaticReport(reportData);
      return { success: true, message: "Reporte automático creado con éxito.", id };
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Error al crear el reporte automático.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    } // cierra finally
  }; // cierra const handleCreateAutomaticReport

  return { handleCreateAutomaticReport, loading, error };
}; // cierra const useCreateAutomaticReport

export default useCreateAutomaticReport;
