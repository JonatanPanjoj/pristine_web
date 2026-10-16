import api from "../../../services/api";
import { Checklist } from "../../../models/Checklist";

interface GetChecklistsOptions {
  searchFields?: Partial<Omit<Checklist, "id" | "createdAt" | "questions">>;
  orderByField?: keyof Omit<Checklist, "questions">;
  orderDirection?: "asc" | "desc";
  pageSize?: number;
  startAfterDoc?: any;
  startAtDoc?: any;
  pageIndex?: number;
  isNext?: boolean;
}

export const getAllChecklistsAdapter = async (options: GetChecklistsOptions = {}) => {
  const { pageSize = 10, searchFields = {} } = options;
  try {
    const response = await api.get('/checklists');
    const rawLists: any[] = response.data?.checklists || [];
    let lists: Checklist[] = rawLists.map((l) => ({
      ...l,
      createdAt: l.createdAt || l.created_at || new Date().toISOString(),
      updatedAt: l.updatedAt || l.updated_at || l.createdAt || l.created_at || new Date().toISOString(),
    }));

    if (searchFields.name) {
      const term = searchFields.name.toLowerCase().trim();
      lists = lists.filter(l => l.name?.toLowerCase().includes(term));
    }

    const totalDocs = lists.length;
    const totalPages = Math.max(1, Math.ceil(totalDocs / pageSize));

    return {
      checklists: lists,
      lastVisible: lists[lists.length - 1] || null,
      firstVisible: lists[0] || null,
      totalPages,
      totalDocs,
    };
  } catch (error) {
    console.error("Error al obtener checklists:", error);
    return { checklists: [], lastVisible: null, firstVisible: null, totalPages: 1, totalDocs: 0 };
  }
};
