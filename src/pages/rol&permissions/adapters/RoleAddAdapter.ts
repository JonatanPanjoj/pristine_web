import api from "../../../services/api";
import { Role } from "../../../models/Role";

export const addRoleToDatabase = async (role: Role): Promise<void> => {
  try {
    const response = await api.post('/roles', role);
    if (!response.data || !response.data.success) {
      throw new Error(response.data?.message || "Error al agregar el rol.");
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "Error al agregar el rol.");
  }
};
