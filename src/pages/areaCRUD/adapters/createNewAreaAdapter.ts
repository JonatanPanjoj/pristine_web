import api from "../../../services/api";
import { Area } from "../../../models/Area";

export const createNewAreaAdapter = async (area: Omit<Area, 'id'>): Promise<string> => {
  try {
    const response = await api.post('/areas', area);
    if (response.data && response.data.success) {
      return response.data.area.id;
    }
    throw new Error(response.data?.message || "No se pudo crear el área.");
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "No se pudo crear el área.");
  }
};
