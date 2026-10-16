import api from "../../../services/api";
import { Area } from "../../../models/Area";

/**
 * Obtiene todas las áreas pertenecientes a un sector.
 *
 * @param sectorId - ID del sector.
 * @returns Promise<Area[]>
 */
export const getAreasBySectorIdAdapter = async (sectorId: string): Promise<Area[]> => {
  try {
    const res = await api.get('/areas', { params: { sectorId } });
    return (res.data?.areas || []).map((a: any) => ({
      ...a,
      id: a.id || a._id,
      SectorId: a.SectorId || a.sector_id,
      sector_id: a.sector_id || a.SectorId,
      SedeId: a.SedeId || a.sede_id,
      sede_id: a.sede_id || a.SedeId,
      is_enabled: a.is_enabled !== false && a.status !== false,
    }));
  } catch (error) {
    console.error("Error al obtener áreas:", error);
    return [];
  }
};
