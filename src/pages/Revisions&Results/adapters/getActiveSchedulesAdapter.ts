// src/pages/Revisions&Results/adapters/getActiveSchedulesAdapter.ts
import api from "../../../services/api";
import { resolveScheduleLocationMaps } from "../../../services/scheduleLocationNames";
import { ChecklistSchedule } from "../../../models/ChecklistSchedule";

const DAY_KEYS: (keyof ChecklistSchedule["activeDays"])[] = [
  "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday",
];

export interface ActiveSchedulesParams {
  sedeId?: string | null;
  sectorId?: string | null;
  areaId?: number | null;
  categoryId?: string | null;
}

export interface ActiveScheduleResult {
  scheduleId:    string;
  checklistId:   string;
  checklistName: string;
  categoryId:    string;
  categoryName:  string;
  sedeId:        string;
  sedeName:      string;
  sectorId:      string;
  sectorName:    string;
  areaId:        number;
  areaName:      string;
  startTime:     string;
  endTime:       string;
  needFirm:      boolean;
  needPhoto:     boolean;
  observations:  string;
  activeDays:    ChecklistSchedule["activeDays"];
  revisionId:    string | null;
  revisionCode?: string | null;
  revisionStatus?: string | null;
}

export const getActiveSchedulesAdapter = async (
  params: ActiveSchedulesParams = {}
): Promise<ActiveScheduleResult[]> => {
  const { sedeId = null, sectorId = null, areaId = null, categoryId = null } = params;

  try {
    const now = new Date();
    const currentDayKey = DAY_KEYS[now.getDay()];
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const todayDateStr = `${year}-${month}-${day}`;

    // 1. Obtener todas las programaciones desde la API
    const schedulesRes = await api.get('/checklist-schedules');
    const rawSchedules: any[] = schedulesRes.data?.schedules || [];

    // 2. Filtrar por habilitadas y activas en el día de hoy (+ filtros de sede/sector/área)
    const schedules = rawSchedules.filter((s) => {
      const isEnabled = s.isEnabled !== false && s.status !== "inactive";
      const days = s.activeDays || {};
      if (!isEnabled || days[currentDayKey] !== true) return false;

      const sSede = s.sedeId || s.sede_id;
      const sSector = s.sectorId || s.sector_id;
      const sArea = s.areaId !== undefined ? s.areaId : s.area_id;

      if (sedeId && sSede !== sedeId) return false;
      if (sectorId && sSector !== sectorId) return false;
      if (areaId != null && sArea !== areaId) return false;

      return true;
    }).map((s) => ({
      id: s.id || s._id,
      checklistId: s.checklistId || s.checklist_id || '',
      checklistName: s.checklistName || s.checklist_name || '',
      sedeId: s.sedeId || s.sede_id || '',
      sectorId: s.sectorId || s.sector_id || '',
      areaId: typeof s.areaId === 'number' ? s.areaId : (typeof s.area_id === 'number' ? s.area_id : Number(s.areaId || s.area_id) || 0),
      startTime: s.startTime || '08:00',
      endTime: s.endTime || '17:00',
      activeDays: s.activeDays,
      observations: s.observations || '',
      isEnabled: s.isEnabled !== false,
    } as ChecklistSchedule));

    if (schedules.length === 0) return [];

    const scheduleIds = new Set(schedules.map((s) => String(s.id)));

    // 3. Consultar revisiones creadas desde la API
    const revisionsRes = await api.get('/checklist-revisions');
    const rawRevisions: any[] = revisionsRes.data?.revisions || [];

    // Indexar revisiones de hoy por scheduleId
    const revisionBySchedule: Record<string, any> = {};
    rawRevisions.forEach((rev) => {
      const schId = String(rev.scheduleId || rev.schedule_id || '');
      if (!scheduleIds.has(schId)) return;

      const rDate = rev.created_at || rev.revision_date || (rev.startDate ? new Date(rev.startDate) : null);
      if (!rDate) return;
      const d = new Date(rDate);
      const cStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

      if (cStr === todayDateStr) {
        if (!revisionBySchedule[schId] || rev.status === 'in_progress' || rev.status === 'completed') {
          revisionBySchedule[schId] = rev;
        }
      }
    });

    // 4. Resolver nombres de ubicaciones y checklist en masa
    const { sedeMap, sectorMap, areaMap, checklistData, categoryMap } =
      await resolveScheduleLocationMaps(schedules as any);

    // 5. Mapear resultados con sus revisiones creadas
    return schedules
      .map((s) => {
        const checklist = checklistData[s.checklistId];
        const catId = checklist?.categoryId ?? "";
        const rev = revisionBySchedule[s.id];
        const revCode = rev ? (rev.custom_id || rev.code || (rev.correlativo ? `REV-${rev.correlativo}` : rev.id)) : null;

        return {
          scheduleId:    s.id,
          checklistId:   s.checklistId,
          checklistName: s.checklistName || checklist?.name || "",
          categoryId:    catId,
          categoryName:  categoryMap[catId] ?? "",
          sedeId:        s.sedeId,
          sedeName:      (s as any).sedeName || sedeMap[s.sedeId] || "",
          sectorId:      s.sectorId,
          sectorName:    (s as any).sectorName || sectorMap[s.sectorId] || "",
          areaId:        s.areaId,
          areaName:      (s as any).areaName || areaMap[s.areaId] || "",
          startTime:     s.startTime,
          endTime:       s.endTime,
          needFirm:      checklist?.needFirm  ?? false,
          needPhoto:     checklist?.needPhoto ?? false,
          observations:  s.observations,
          activeDays:    s.activeDays,
          revisionId:    rev ? (rev.custom_id || rev.id || rev._id) : null,
          revisionCode:  revCode,
          revisionStatus: rev ? (rev.status || 'pending') : null,
        };
      })
      .filter((r) => !categoryId || r.categoryId === categoryId);

  } catch (error) {
    console.error("Error fetching active schedules:", error);
    throw new Error("Could not fetch active schedules.");
  }
};
