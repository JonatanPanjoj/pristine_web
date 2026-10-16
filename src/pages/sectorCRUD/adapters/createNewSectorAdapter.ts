import api from "../../../services/api";
import { Sector } from "../../../models/Sector";

export const createNewSectorAdapter = async (sector: Omit<Sector, 'id'>): Promise<string> => {
  try {
    const response = await api.post('/sectors', sector);
    if (response.data && response.data.success) {
      return response.data.sector.id;
    }
    throw new Error(response.data?.message || "No se pudo crear el sector.");
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "No se pudo crear el sector.");
  }
};
