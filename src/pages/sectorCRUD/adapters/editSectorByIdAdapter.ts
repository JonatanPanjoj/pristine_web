import api from "../../../services/api";
import { Sector } from "../../../models/Sector";

export const editSectorByIdAdapter = async (sector: Sector): Promise<void> => {
  try {
    const response = await api.put(`/sectors/${sector.id}`, sector);
    if (!response.data || !response.data.success) {
      throw new Error(response.data?.message || "No se pudo actualizar el sector.");
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "No se pudo actualizar el sector.");
  }
};
