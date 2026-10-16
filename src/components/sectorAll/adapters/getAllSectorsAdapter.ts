import api from "../../../services/api";
import { Sector } from "../../../models/Sector";

interface GetSectorsOptions {
  searchFields?: Partial<Omit<Sector, 'id' | 'created_at'>>;
  sedeIds?: string[];
  pageSize?: number;
}

export const getAllSectorsAdapter = async (options: GetSectorsOptions = {}) => {
  const { searchFields = {}, sedeIds = [], pageSize = 10 } = options;

  try {
    const params: any = {};
    if (searchFields.name) {
      params.search = searchFields.name;
    }
    // Si se pasa exactamente una sede seleccionada, filtrar desde backend
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

    // Si hay más de una sede en sedeIds, filtrar en memoria
    if (sedeIds.length > 1) {
      allSectors = allSectors.filter((s: any) =>
        sedeIds.includes(s.SedeId) || sedeIds.includes(s.sede_id)
      );
    }

    // Filtro adicional por nombre si aplica
    if (searchFields.name) {
      const term = searchFields.name.toLowerCase().trim();
      allSectors = allSectors.filter((s: Sector) => s.name?.toLowerCase().includes(term));
    }

    const totalDocs = allSectors.length;
    const totalPages = Math.max(1, Math.ceil(totalDocs / pageSize));

    return {
      sectors: allSectors,
      lastVisible: allSectors[allSectors.length - 1] || null,
      firstVisible: allSectors[0] || null,
      totalDocs,
      totalPages,
    };
  } catch (error) {
    console.error("Error al obtener sectores desde API:", error);
    return {
      sectors: [],
      lastVisible: null,
      firstVisible: null,
      totalDocs: 0,
      totalPages: 0,
    };
  }
};
