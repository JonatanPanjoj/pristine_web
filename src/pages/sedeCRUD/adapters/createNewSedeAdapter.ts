import api from "../../../services/api";
import { Sede } from "../../../models/Sede";

export const createNewSedeAdapter = async (sede: Omit<Sede, 'id'>): Promise<string> => {
  try {
    const response = await api.post('/sedes', sede);
    if (response.data && response.data.success) {
      return response.data.sede.id;
    }
    throw new Error(response.data?.message || "No se pudo crear la sede.");
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "No se pudo crear la sede.");
  }
};
