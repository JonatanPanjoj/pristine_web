import api from "../../../services/api";

export const toggleAreaStatus = async (id: string, currentStatus?: boolean): Promise<{ id: string; is_enabled: boolean }> => {
  const newStatus = currentStatus !== undefined ? !currentStatus : true;
  await api.put(`/areas/${id}`, { status: newStatus, is_enabled: newStatus });
  return { id, is_enabled: newStatus };
};
