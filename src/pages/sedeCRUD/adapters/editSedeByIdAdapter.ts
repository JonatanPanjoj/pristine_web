import api from "../../../services/api";
import { Sede } from "../../../models/Sede";

export const editSedeByIdAdapter = async (sede: Sede): Promise<void> => {
  try {
    const response = await api.put(`/sedes/${sede.id}`, sede);
    if (!response.data || !response.data.success) {
      throw new Error(response.data?.message || "No se pudo editar la sede.");
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "No se pudo editar la sede.");
  }
};
