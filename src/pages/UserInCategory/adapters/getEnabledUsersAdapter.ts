import api from "../../../services/api";
import { User } from "../../../models/User";

interface GetUsersOptions {
  pageSize: number;
  lastDoc?: any;
}

export async function getEnabledUsersAdapter({ pageSize }: GetUsersOptions) {
  try {
    const response = await api.get('/users', { params: { limit: pageSize, status: true } });
    const users: User[] = response.data?.users || [];
    return {
      users,
      lastVisible: users[users.length - 1] || null,
      hasMore: false,
    };
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return { users: [], lastVisible: null, hasMore: false };
  }
}
