// hooks/useScheduleCompliance.ts
// Reemplaza: useProgramingsByPeriod (+ función suelta getProgramingsData)
// Cambios:   usa getScheduleComplianceByPeriodAdapter
//            CompliancePeriod en inglés: "daily" | "weekly" | "monthly"
//            periodLabel + compliancePercentage en vez de PeriodoUnitario + Porcentaje
//            fetchDirect expuesto para generar PDF/Excel sin pasar por el estado del hook

import { useState, useCallback } from "react";
import {
  getScheduleComplianceByPeriodAdapter,
  GetScheduleComplianceParams,
  CompliancePeriodResult,
} from "../adapters/getScheduleComplianceByPeriodAdapter";

interface UseScheduleComplianceReturn {
  data: CompliancePeriodResult[] | null;
  loading: boolean;
  error: string | null;
  fetchCompliance: (params: GetScheduleComplianceParams) => Promise<void>;
  // Reemplaza la función suelta getProgramingsData — misma firma, sin estado
  fetchDirect: (params: GetScheduleComplianceParams) => Promise<CompliancePeriodResult[]>;
}

export const useScheduleCompliance = (): UseScheduleComplianceReturn => {
  const [data, setData] = useState<CompliancePeriodResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompliance = useCallback(async (params: GetScheduleComplianceParams) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getScheduleComplianceByPeriodAdapter(params);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load compliance data.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Llamada directa sin tocar el estado — para exportar PDF/Excel
  const fetchDirect = useCallback(
    (params: GetScheduleComplianceParams) =>
      getScheduleComplianceByPeriodAdapter(params),
    []
  );

  return { data, loading, error, fetchCompliance, fetchDirect };
};
