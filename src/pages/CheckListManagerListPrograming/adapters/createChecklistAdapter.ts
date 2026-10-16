import api from "../../../services/api";
import { Checklist } from "../../../models/Checklist";

export const createChecklistAdapter = async (
  checklist: Omit<Checklist, "id">
): Promise<string> => {
  try {
    const response = await api.post('/checklists', checklist);
    if (response.data && response.data.success) {
      return response.data.checklist.id;
    }
    throw new Error(response.data?.message || "No se pudo crear el checklist.");
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "No se pudo crear el checklist.");
  }
};
