import api from "../../../../services/api";
import { ChecklistSchedule } from "../../../../models/ChecklistSchedule";

export const createScheduleAdapter = async (
  schedule: Omit<ChecklistSchedule, "id">
): Promise<string> => {
  try {
    const payload = {
      ...schedule,
      area_id: typeof schedule.areaId === "number" ? schedule.areaId : parseInt(String(schedule.areaId), 10),
      checklist_id: schedule.checklistId,
      sede_id: schedule.sedeId,
      sector_id: schedule.sectorId,
    };
    const response = await api.post('/checklist-schedules', payload);
    if (response.data && response.data.success) {
      return response.data.schedule.id;
    }
    throw new Error(response.data?.message || "No se pudo crear el schedule.");
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "No se pudo crear el schedule.");
  }
};
