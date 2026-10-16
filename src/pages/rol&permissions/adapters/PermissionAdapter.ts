import api from "../../../services/api";

export const fetchPermissionsByKeys = async (keys: string[]): Promise<string[]> => {
  try {
    const response = await api.get('/permissions');
    const all = response.data?.permissions || [];
    return all.filter((p: any) => keys.includes(p.key)).map((p: any) => p.id);
  } catch (error) {
    console.error("Error al obtener permissions:", error);
    return [];
  }
};
