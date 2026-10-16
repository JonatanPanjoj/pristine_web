import api from "../../../services/api";
import { Area } from "../../../models/Area";

interface GetAreasOptions {
  searchFields?: Partial<Omit<Area, 'id' | 'created_at'>>;
  orderByField?: keyof Area;
  orderDirection?: 'asc' | 'desc';
  pageSize?: number;
  startAfterDoc?: any;
  startAtDoc?: any;
  pageIndex?: number;
  isNext?: boolean;
  sectorIds?: string[];
}

export const getAllAreasAdapter = async (options: GetAreasOptions = {}) => {
  const { sectorIds = [], pageSize = 10, searchFields = {} } = options;
  try {
    const response = await api.get('/areas');
    let areas: Area[] = response.data?.areas || [];

    if (sectorIds.length > 0) {
      areas = areas.filter((a) => {
        const secId = a.sector_id || a.SectorId;
        return Boolean(secId && sectorIds.includes(secId));
      });
    }

    if (searchFields.name) {
      const term = searchFields.name.toLowerCase().trim();
      areas = areas.filter(a => a.name.toLowerCase().includes(term));
    }

    const totalDocs = areas.length;
    const totalPages = Math.max(1, Math.ceil(totalDocs / pageSize));

    return {
      areas,
      lastVisible: areas[areas.length - 1] || null,
      firstVisible: areas[0] || null,
      totalDocs,
      totalPages,
    };
  } catch (error) {
    console.error("Error al obtener áreas:", error);
    return { areas: [], lastVisible: null, firstVisible: null, totalDocs: 0, totalPages: 0 };
  }
};
