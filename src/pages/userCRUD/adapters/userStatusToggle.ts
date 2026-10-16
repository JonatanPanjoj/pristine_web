import api from "../../../services/api";

export const toggleUserStatus = async (id: string) => {
  const response = await api.patch(`/users/${id}/status`);
  if (response.data && response.data.success) {
    const updated = response.data.user;
    return { id, is_enabled: updated.status, status: updated.status };
  }
  throw new Error(response.data?.message || 'Error al cambiar estado de usuario');
};
