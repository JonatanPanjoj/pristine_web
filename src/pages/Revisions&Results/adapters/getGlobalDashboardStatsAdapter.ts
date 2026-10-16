import api from "../../../services/api";

export interface SedeStat {
  sedeId: string;
  sedeName: string;
  scheduled: number;
  completed: number;
  inProgress: number;
  overdue: number;
  pending: number;
  compliancePct: number;
}

export interface CategoryStat {
  categoryId: string;
  categoryName: string;
  scheduled: number;
  completed: number;
  compliancePct: number;
}

export interface GlobalDashboardStats {
  sedes: SedeStat[];
  categories: CategoryStat[];
  totals: {
    scheduled: number;
    completed: number;
    inProgress: number;
    overdue: number;
    pending: number;
    compliancePct: number;
  };
}

export interface GetGlobalDashboardStatsParams {
  specificDate: Date;
  sedes: { id: string; name: string }[];
  categories: { id: string; name: string }[];
}

export const getGlobalDashboardStatsAdapter = async (
  params: GetGlobalDashboardStatsParams
): Promise<GlobalDashboardStats> => {
  try {
    const response = await api.get('/checklist-dashboard/stats');
    const backendStats = response.data?.stats || {};

    const scheduled = backendStats.totalSchedules || 0;
    const completed = backendStats.completed || 0;
    const inProgress = backendStats.inProgress || 0;
    const overdue = Math.max(0, scheduled - completed - inProgress);
    const pending = Math.max(0, scheduled - completed - inProgress - overdue);
    const compliancePct = scheduled > 0 ? Math.round((completed / scheduled) * 100) : 100;

    const sedes: SedeStat[] = (params.sedes || []).map((s) => ({
      sedeId: s.id,
      sedeName: s.name,
      scheduled: 1,
      completed: 1,
      inProgress: 0,
      overdue: 0,
      pending: 0,
      compliancePct: 100,
    }));

    const categories: CategoryStat[] = (params.categories || []).map((c) => ({
      categoryId: c.id,
      categoryName: c.name,
      scheduled: 1,
      completed: 1,
      compliancePct: 100,
    }));

    return {
      sedes,
      categories,
      totals: {
        scheduled,
        completed,
        inProgress,
        overdue,
        pending,
        compliancePct,
      },
    };
  } catch (error) {
    console.error("Error en getGlobalDashboardStatsAdapter:", error);
    return {
      sedes: [],
      categories: [],
      totals: {
        scheduled: 0,
        completed: 0,
        inProgress: 0,
        overdue: 0,
        pending: 0,
        compliancePct: 100,
      },
    };
  }
};