import api from "../../../services/api";

export const toggleSectorStatus = async (id: string, currentStatus?: boolean): Promise<{ id: string; is_enabled: boolean }> => {
  const newStatus = currentStatus !== undefined ? !currentStatus : true;
  await api.put(`/sectors/${id}`, { status: newStatus, is_enabled: newStatus });
  return { id, is_enabled: newStatus };
};
