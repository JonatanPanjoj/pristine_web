import api from "../../../services/api";
import { User } from "../../../models/User";

interface GetUsersOptions {
  searchFields?: Partial<Omit<User, 'id' | 'created_at'>>;
  orderByField?: keyof User;
  orderDirection?: 'asc' | 'desc';
  pageSize?: number;
  startAfterDoc?: any;
}

export const generateSearchTokens = (
  name: string = "",
  username: string = "",
  email: string = "",
  phone: string = ""
): string[] => {
  const tokens: Set<string> = new Set();
  const rawString = `${name} ${username} ${email} ${phone}`;
  const words = rawString.toLowerCase().split(/[\s@.\-_]+/);
  words.forEach(word => {
    if (word) {
      for (let i = 1; i <= word.length; i++) {
        tokens.add(word.substring(0, i));
      }
    }
  });
  return Array.from(tokens);
};

export const createUser = async (user: User): Promise<string> => {
  const response = await api.post('/users', user);
  if (response.data && response.data.success) {
    return response.data.user.id;
  }
  throw new Error(response.data?.message || 'Error al crear usuario');
};

export const getAllUsers = async (options: GetUsersOptions = {}) => {
  const { searchFields = {}, pageSize = 50 } = options;
  const searchTerm = searchFields.name || searchFields.user || '';
  const role = searchFields.rol || '';

  const params: any = { limit: pageSize };
  if (searchTerm) params.search = searchTerm;
  if (role) params.role = role;

  const response = await api.get('/users', { params });
  const users: User[] = response.data?.users || [];

  return {
    users,
    lastVisible: users.length > 0 ? users[users.length - 1] : null,
    hasMore: false,
  };
};

export const checkAndMigrateIfNeeded = async () => {
  // En MongoDB los índices y búsquedas son nativos y automáticos
  console.log('[Pristine MongoDB] Sistema de indexación optimizado.');
};

export const updateUserSedes = async (userId: string, sedeIds: string[]): Promise<void> => {
  await api.put(`/users/${userId}/sedes`, { sedes: sedeIds });
};
