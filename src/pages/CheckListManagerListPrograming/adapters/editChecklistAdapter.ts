import api from "../../../services/api";
import { Checklist } from "../../../models/Checklist";

export const editChecklistAdapter = async (checklist: Checklist): Promise<void> => {
  try {
    const response = await api.put(`/checklists/${checklist.id}`, checklist);
    if (!response.data || !response.data.success) {
      throw new Error(response.data?.message || "No se pudo editar el checklist.");
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "No se pudo editar el checklist.");
  }
};
