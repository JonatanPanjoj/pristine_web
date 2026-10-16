import api from "../../../../services/api";

export const toggleScheduleStatusAdapter = async (
  id: string
): Promise<{ id: string; isEnabled: boolean; updatedAt: string }> => {
  const current = await api.get('/checklist-schedules');
  const found = (current.data?.schedules || []).find((s: any) => s.id === id);
  const newStatus = !(found?.isEnabled ?? found?.status ?? true);
  const updatedAt = new Date().toISOString();

  await api.put(`/checklist-schedules/${id}`, { status: newStatus ? 'active' : 'inactive', isEnabled: newStatus });
  return { id, isEnabled: newStatus, updatedAt };
};
