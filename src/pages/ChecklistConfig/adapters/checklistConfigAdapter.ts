import api from "../../../services/api";
import { ChecklistConfig } from "../../../models/ChecklistConfig";

export const getChecklistConfigAdapter = async (): Promise<ChecklistConfig> => {
  try {
    const response = await api.get('/checklist-config');
    if (response.data && response.data.success) {
      return response.data.config;
    }
    return { requireQR: false };
  } catch (error) {
    console.error("Error fetching checklist config:", error);
    return { requireQR: false };
  }
};

export const saveChecklistConfigAdapter = async (config: ChecklistConfig): Promise<void> => {
  try {
    await api.put('/checklist-config', config);
  } catch (error) {
    console.error("Error saving checklist config:", error);
    throw new Error("No se pudo guardar la configuración del checklist.");
  }
};
