import api from "../../../services/api";
import { Categoria_Checklist } from "../../../models/Categoria_Checklist";

interface GetChecklistCategoriasOptions {
  searchFields?: Partial<Omit<Categoria_Checklist, 'id' | 'created_at'>>;
  orderByField?: keyof Categoria_Checklist;
  orderDirection?: 'asc' | 'desc';
  pageSize?: number;
  startAfterDoc?: any;
  startAtDoc?: any;
  pageIndex?: number;
  isNext?: boolean;
}

export const getAllChecklistCategoriasAdapter = async (options: GetChecklistCategoriasOptions = {}) => {
  const { pageSize = 10, searchFields = {} } = options;
  try {
    const response = await api.get('/checklist-categories');
    let categories: Categoria_Checklist[] = response.data?.categories || [];

    if (searchFields.name) {
      const term = searchFields.name.toLowerCase().trim();
      categories = categories.filter(c => c.name?.toLowerCase().includes(term));
    }

    const totalDocs = categories.length;
    const totalPages = Math.max(1, Math.ceil(totalDocs / pageSize));

    return {
      categorias: categories,
      lastVisible: categories[categories.length - 1] || null,
      firstVisible: categories[0] || null,
      totalPages,
      totalDocs,
    };
  } catch (error) {
    console.error("Error al obtener categorías de checklist:", error);
    return { categorias: [], lastVisible: null, firstVisible: null, totalPages: 1, totalDocs: 0 };
  }
};
