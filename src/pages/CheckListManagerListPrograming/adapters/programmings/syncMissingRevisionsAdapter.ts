// src/pages/CheckListManagerListPrograming/adapters/programmings/syncMissingRevisionsAdapter.ts
import api from "../../../../services/api";

export interface SyncResult {
  syncedCount: number;
}

/**
 * Sincroniza y genera las revisiones faltantes del día de hoy
 * basadas en las programaciones (schedules) activas con IDs amigables (REV-XXXX).
 */
export const syncMissingRevisionsAdapter = async (): Promise<SyncResult> => {
  try {
    const response = await api.post('/checklist-revisions/sync-missing');
    if (response.data && response.data.success !== false) {
      return { syncedCount: response.data.syncedCount ?? 0 };
    }
    throw new Error(response.data?.message || "No se pudieron sincronizar las revisiones faltantes.");
  } catch (error: any) {
    console.error("Error al sincronizar revisiones faltantes:", error);
    throw new Error(error.response?.data?.message || error.message || "No se pudieron sincronizar las revisiones faltantes.");
  }
};
