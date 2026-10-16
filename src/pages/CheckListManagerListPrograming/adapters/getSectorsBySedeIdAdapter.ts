import api from "../../../services/api";
import { Sector } from "../../../models/Sector";

/**
 * Obtiene todos los sectores pertenecientes a una sede.
 *
 * @param sedeId - ID de la sede.
 * @returns Promise<Sector[]>
 */
export const getSectorsBySedeIdAdapter = async (sedeId: string): Promise<Sector[]> => {
  try {
    const res = await api.get('/sectors', { params: { sedeId } });
    return (res.data?.sectors || []).map((s: any) => ({
      ...s,
      id: s.id || s._id,
      SedeId: s.SedeId || s.sede_id,
      sede_id: s.sede_id || s.SedeId,
      is_enabled: s.is_enabled !== false && s.status !== false,
    }));
  } catch (error) {
    console.error("Error al obtener sectores:", error);
    return [];
  }
};
