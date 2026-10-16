import api from "../../../services/api";
import { Sector } from "../../../models/Sector";

interface GetSectorsBySedeIdsOptions {
  sedeIds?: string[];
}

export const getSectorsBySedeIdsAdapter = async (options: GetSectorsBySedeIdsOptions) => {
  const { sedeIds = [] } = options;

  try {
    const params: any = {};
    if (sedeIds.length === 1 && sedeIds[0]) {
      params.sedeId = sedeIds[0];
    }

    const response = await api.get('/sectors', { params });
    let allSectors: Sector[] = (response.data?.sectors || []).map((s: any) => ({
      ...s,
      id: s.id || s._id,
      SedeId: s.SedeId || s.sede_id,
      sede_id: s.sede_id || s.SedeId,
      is_enabled: s.is_enabled !== false && s.status !== false,
    }));

    if (sedeIds.length > 1) {
      allSectors = allSectors.filter((s: any) =>
        sedeIds.includes(s.SedeId) || sedeIds.includes(s.sede_id)
      );
    }

    return {
      sectors: allSectors,
      totalDocs: allSectors.length,
    };
  } catch (error) {
    console.error("Error al obtener sectores por sedeIds:", error);
    return {
      sectors: [],
      totalDocs: 0,
    };
  }
};
