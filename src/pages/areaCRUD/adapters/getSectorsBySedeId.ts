import api from "../../../services/api";
import { Sector } from "../../../models/Sector";

// Función para obtener todos los sectores con el SedeId especificado
export const getSectorsBySedeId = async (sedeId: string): Promise<Sector[]> => {
  try {
    const res = await api.get('/sectors', { params: { sedeId } });
    const sectors: Sector[] = (res.data?.sectors || []).map((s: any) => ({
      ...s,
      id: s.id || s._id,
      SedeId: s.SedeId || s.sede_id,
      sede_id: s.sede_id || s.SedeId,
      is_enabled: s.is_enabled !== false && s.status !== false,
    }));
    return sectors;
  } catch (error) {
    console.error("Error al obtener sectores por sedeId:", error);
    return [];
  }
};
