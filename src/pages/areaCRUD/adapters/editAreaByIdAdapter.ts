import api from "../../../services/api";
import { Area } from "../../../models/Area";

export const editAreaByIdAdapter = async (area: Area): Promise<void> => {
  try {
    const response = await api.put(`/areas/${area.id}`, area);
    if (!response.data || !response.data.success) {
      throw new Error(response.data?.message || "No se pudo actualizar el área.");
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "No se pudo actualizar el área.");
  }
};
