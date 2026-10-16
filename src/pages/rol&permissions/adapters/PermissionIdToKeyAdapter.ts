import api from "../../../services/api";

export const fetchPermissionKeysByIds = async (permissionIds: string[]): Promise<string[]> => {
  if (!permissionIds || permissionIds.length === 0) return [];
  try {
    const response = await api.get('/permissions');
    const all = response.data?.permissions || [];
    return all
      .filter((p: any) => permissionIds.includes(p.id) || permissionIds.includes(p.key))
      .map((p: any) => p.key);
  } catch (error) {
    console.error("Error al obtener las keys de los permisos:", error);
    return [];
  }
};
