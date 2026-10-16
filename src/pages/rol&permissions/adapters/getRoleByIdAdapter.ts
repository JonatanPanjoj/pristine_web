import api from "../../../services/api";
import { Role } from "../../../models/Role";

export const getRoleByIdAdapter = async (roleId: string): Promise<Role | null> => {
  try {
    const response = await api.get('/roles');
    const roles: Role[] = response.data?.roles || [];
    return roles.find(r => r.id === roleId) || null;
  } catch (error) {
    console.error("Error al obtener el rol por ID:", error);
    return null;
  }
};
