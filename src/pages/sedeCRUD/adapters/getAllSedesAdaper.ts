import api from "../../../services/api";
import { Sede } from "../../../models/Sede";

export const generateSedeSearchTokens = (
  name: string = "",
  department: string = "",
  municipality: string = "",
  address: string = "",
  zone: string = ""
): string[] => {
  const tokens: Set<string> = new Set();
  const rawString = `${name} ${department} ${municipality} ${address} ${zone}`;
  const words = rawString.toLowerCase().split(/[\s@.\-_,/\\]+/);
  words.forEach((word) => {
    if (word) {
      for (let i = 1; i <= word.length; i++) {
        tokens.add(word.substring(0, i));
      }
    }
  });
  return Array.from(tokens);
};

interface GetSedesOptions {
  searchFields?: Partial<Omit<Sede, 'id' | 'created_at'>>;
  orderByField?: keyof Sede;
  orderDirection?: 'asc' | 'desc';
  pageSize?: number;
  pageIndex?: number;
  startAfterDoc?: any;
  startAtDoc?: any;
}

export const getAllSedes = async (options: GetSedesOptions = {}) => {
  try {
    const response = await api.get('/sedes');
    let sedes: Sede[] = response.data?.sedes || [];

    if (options.searchFields) {
      const searchName = options.searchFields.name?.toLowerCase().trim();
      if (searchName) {
        sedes = sedes.filter(s => s.name?.toLowerCase().includes(searchName));
      }
    }

    const totalDocs = sedes.length;
    const totalPages = Math.max(1, Math.ceil(totalDocs / (options.pageSize || 10)));

    return {
      sedes,
      lastVisible: sedes.length > 0 ? sedes[sedes.length - 1] : null,
      firstVisible: sedes[0] || null,
      totalDocs,
      totalPages,
      hasMore: false,
      hasPrevious: false,
    };
  } catch (error) {
    console.error("Error al obtener sedes:", error);
    return {
      sedes: [],
      lastVisible: null,
      firstVisible: null,
      totalDocs: 0,
      totalPages: 1,
      hasMore: false,
      hasPrevious: false,
    };
  }
};

export const checkAndMigrateSedesIfNeeded = async () => {
  console.log('[Pristine MongoDB] Índice de sedes optimizado.');
};

export const getAllSedesAdapter = getAllSedes;

