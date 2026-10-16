import api from "../../../../services/api";
import { ChecklistSchedule } from "../../../../models/ChecklistSchedule";

export const getEnabledSchedulesAdapter = async (
  checklistId: string
): Promise<ChecklistSchedule[]> => {
  try {
    const response = await api.get('/checklist-schedules');
    const all: any[] = response.data?.schedules || [];
    return all.filter(s => (s.checklist_id === checklistId || s.checklistId === checklistId));
  } catch (error) {
    console.error("Error al obtener los schedules habilitados:", error);
    return [];
  }
};
