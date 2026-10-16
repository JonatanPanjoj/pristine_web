import api from "../../../services/api";
import { Role } from "../../../models/Role";

export const getAllRoles = async (): Promise<Role[]> => {
  try {
    const response = await api.get('/roles');
    return response.data?.roles || [];
  } catch (error) {
    console.error("Error al obtener roles:", error);
    return [];
  }
};

export const getRoleById = async (roleId: string) => {
  try {
    const roles = await getAllRoles();
    return roles.find(r => r.id === roleId || r.name === roleId) || null;
  } catch (error) {
    console.error("Error al obtener el rol:", error);
    return null;
  }
};

export const getPermissionsByIds = async (permissionsIds: string[]) => {
  try {
    const response = await api.get('/permissions');
    const all = response.data?.permissions || [];
    return all
      .filter((p: any) => permissionsIds.includes(p.id) || permissionsIds.includes(p.key))
      .map((p: any) => p.key);
  } catch (error) {
    console.error("Error al obtener permisos:", error);
    return [];
  }
};