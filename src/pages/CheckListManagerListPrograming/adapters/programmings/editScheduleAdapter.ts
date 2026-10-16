import api from "../../../../services/api";
import { ChecklistSchedule } from "../../../../models/ChecklistSchedule";

export const editScheduleAdapter = async (schedule: ChecklistSchedule): Promise<void> => {
  try {
    const response = await api.put(`/checklist-schedules/${schedule.id}`, schedule);
    if (!response.data || !response.data.success) {
      throw new Error(response.data?.message || "No se pudo editar el schedule.");
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "No se pudo editar el schedule.");
  }
};
