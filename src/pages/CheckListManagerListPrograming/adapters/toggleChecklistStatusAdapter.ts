import api from "../../../services/api";

export const toggleChecklistStatusAdapter = async (
  id: string
): Promise<{ id: string; isEnabled: boolean; updatedAt: string }> => {
  const current = await api.get('/checklists');
  const found = (current.data?.checklists || []).find((c: any) => c.id === id);
  const newStatus = !(found?.isEnabled ?? found?.status ?? true);
  const updatedAt = new Date().toISOString();

  await api.put(`/checklists/${id}`, { status: newStatus, isEnabled: newStatus });
  return { id, isEnabled: newStatus, updatedAt };
};
