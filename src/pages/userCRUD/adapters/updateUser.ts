import api from "../../../services/api";
import { User } from "../../../models/User";

export const updateUser = async (userId: string, updatedUser: User): Promise<string> => {
  try {
    const id = updatedUser.id || userId;
    const response = await api.put(`/users/${id}`, updatedUser);
    if (response.data && response.data.success) {
      return response.data.user.id;
    }
    throw new Error(response.data?.message || 'Error al actualizar usuario');
  } catch (error: any) {
    const msg = error.response?.data?.message || error.message || 'Error al actualizar usuario';
    throw new Error(msg);
  }
};