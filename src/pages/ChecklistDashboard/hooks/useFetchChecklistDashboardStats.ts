import { useState, useEffect } from "react";
import api from "../../../services/api";

export interface SedeCompliancePoint {
  name: string;
  value: number;
}

export interface StatusPoint {
  name: string;
  value: number;
  color: string;
}

export interface TrendPoint {
  name: string;
  value: number;
}

export interface HeatmapRow {
  area: string;
  '06:00': number;
  '12:00': number;
  '18:00': number;
  '22:00': number;
}

export interface WorstAreaPoint {
  name: string;
  value: number;
}

export interface ChecklistDashboardStats {
  compliancePct: number;
  coveragePct: number | null;
  overdueCount: number;
  inProgressCount: number;
  scheduledToday: number;
  executedToday: number;
  periodLabel: string;
  worstAreaName: string;
  worstAreaPct?: number;
  locationCompliance: SedeCompliancePoint[];
  bySede?: SedeCompliancePoint[];
  statusData: StatusPoint[];
  byStatus?: StatusPoint[];
  trendData: TrendPoint[];
  trend?: TrendPoint[];
  heatmapData: HeatmapRow[];
  heatmap?: HeatmapRow[];
  worstAreas: WorstAreaPoint[];
  lastUpdatedAt: string;
}

export const useFetchChecklistDashboardStats = (filters?: any) => {
  const [stats, setStats] = useState<ChecklistDashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const filtersKey = JSON.stringify(filters || {});

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        setLoading(true);

        const params: any = {};
        if (filters) {
          if (filters.sedeId) params.sedeId = filters.sedeId;
          if (filters.sectorId) params.sectorId = filters.sectorId;
          if (filters.areaId) params.areaId = filters.areaId;
          if (filters.categoryId) params.categoryId = filters.categoryId;
          if (filters.statusId) params.statusId = filters.statusId;
          if (filters.startDate) params.startDate = filters.startDate;
          if (filters.endDate) params.endDate = filters.endDate;
        }

        const response = await api.get('/checklist-dashboard/stats', { params });

        if (!isMounted) return;

        const backendStats = response.data?.stats;
        if (backendStats) {
          setStats({
            compliancePct: backendStats.compliancePct ?? 100,
            coveragePct: backendStats.coveragePct ?? 100,
            overdueCount: backendStats.overdueCount ?? 0,
            inProgressCount: backendStats.inProgressCount ?? 0,
            scheduledToday: backendStats.scheduledToday ?? 0,
            executedToday: backendStats.executedToday ?? 0,
            periodLabel: backendStats.periodLabel ?? 'General',
            worstAreaName: backendStats.worstAreaName ?? 'Sin incidencias',
            worstAreaPct: backendStats.worstAreaPct ?? 100,
            locationCompliance: backendStats.locationCompliance || backendStats.bySede || [],
            bySede: backendStats.bySede || backendStats.locationCompliance || [],
            statusData: backendStats.statusData || backendStats.byStatus || [],
            byStatus: backendStats.byStatus || backendStats.statusData || [],
            trendData: backendStats.trendData || backendStats.trend || [],
            trend: backendStats.trend || backendStats.trendData || [],
            heatmapData: backendStats.heatmapData || backendStats.heatmap || [],
            heatmap: backendStats.heatmap || backendStats.heatmapData || [],
            worstAreas: backendStats.worstAreas || [],
            lastUpdatedAt: backendStats.lastUpdatedAt || new Date().toISOString(),
          });
          setError(null);
        } else {
          setError('No se pudieron obtener las estadísticas del servidor.');
        }
      } catch (err: any) {
        console.error('Error al cargar estadísticas:', err);
        setError('Error al cargar las estadísticas del dashboard.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, [filtersKey]);

  return { stats, loading, error };
};
