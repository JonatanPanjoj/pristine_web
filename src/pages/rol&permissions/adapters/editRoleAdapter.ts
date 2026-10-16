import api from "../../../services/api";
import { Role } from "../../../models/Role";

export const editRoleInDatabase = async (updatedRole: Role): Promise<void> => {
  try {
    const response = await api.put(`/roles/${updatedRole.id}`, updatedRole);
    if (!response.data || !response.data.success) {
      throw new Error(response.data?.message || "Error al actualizar el rol.");
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "Error al actualizar el rol.");
  }
};
