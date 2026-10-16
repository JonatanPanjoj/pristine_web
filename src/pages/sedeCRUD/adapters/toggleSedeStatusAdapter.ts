import api from "../../../services/api";

export const toggleSedeStatus = async (id: string) => {
  const current = await api.get('/sedes');
  const found = (current.data?.sedes || []).find((s: any) => s.id === id);
  const newStatus = !(found?.status ?? found?.is_enabled ?? true);

  await api.put(`/sedes/${id}`, { status: newStatus, is_enabled: newStatus });
  return { id, is_enabled: newStatus, status: newStatus, updated_at: new Date().toISOString() };
};
