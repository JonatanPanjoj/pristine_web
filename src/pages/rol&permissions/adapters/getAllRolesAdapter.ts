import api from "../../../services/api";
import { Role } from "../../../models/Role";

interface GetRolesOptions {
  searchFields?: Partial<Omit<Role, 'id'>>;
  orderByField?: keyof Role;
  orderDirection?: 'asc' | 'desc';
  pageSize?: number;
  startAfterDoc?: any;
  pageIndex?: number;
  isNext?: boolean;
}

export const getAllRolesAdapter = async (options: GetRolesOptions = {}) => {
  const { pageSize = 10 } = options;
  try {
    const response = await api.get('/roles');
    const roles: Role[] = response.data?.roles || [];
    const totalDocs = roles.length;
    const totalPages = Math.max(1, Math.ceil(totalDocs / pageSize));

    return {
      roles,
      lastVisible: roles[roles.length - 1] || null,
      firstVisible: roles[0] || null,
      totalPages,
      totalDocs,
    };
  } catch (error) {
    console.error("Error al obtener roles:", error);
    return { roles: [], lastVisible: null, firstVisible: null, totalPages: 1, totalDocs: 0 };
  }
};
