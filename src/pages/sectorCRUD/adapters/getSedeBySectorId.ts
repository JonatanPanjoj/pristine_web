import api from "../../../services/api";
import { getAllSedesFromCache } from "../../../services/sedeStorage";

export const getSedeById = async (sedeId: string): Promise<string | null> => {
  if (!sedeId) return null;

  const cached = getAllSedesFromCache();
  const found = cached?.find((s: any) => s.id === sedeId || s._id === sedeId);
  if (found) {
    return found.name;
  }

  try {
    const res = await api.get('/sedes');
    const sedes = res.data?.sedes || [];
    const match = sedes.find((s: any) => s.id === sedeId || s._id === sedeId);
    return match ? match.name : null;
  } catch (error) {
    console.error("Error al obtener sede por ID:", error);
    return null;
  }
};