// hooks/useGlobalDashboardStats.ts
// NUEVO — estado del TABLERO GENERAL (todas las sedes).
// Mismo patrón que useSchedulesByDate: fetch manual con params reales,
// sin auto-fetch con listas vacías.

import { useState, useCallback } from "react";
import {
  getGlobalDashboardStatsAdapter,
  GetGlobalDashboardStatsParams,
  GlobalDashboardStats,
} from "../adapters/getGlobalDashboardStatsAdapter";

interface UseGlobalDashboardStatsReturn {
  stats: GlobalDashboardStats | null;
  loading: boolean;
  error: string | null;
  fetchStats: (params: GetGlobalDashboardStatsParams) => Promise<void>;
}

export const useGlobalDashboardStats = (): UseGlobalDashboardStatsReturn => {
  const [stats, setStats] = useState<GlobalDashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async (params: GetGlobalDashboardStatsParams) => {
    if (params.sedes.length === 0) return; // esperar sedes reales
    setLoading(true);
    setError(null);
    try {
      const result = await getGlobalDashboardStatsAdapter(params);
      setStats(result);
    } catch (err) {
      setError((err as Error).message || "Could not load global stats.");
    } finally {
      setLoading(false);
    }
  }, []);

  return { stats, loading, error, fetchStats };
};
