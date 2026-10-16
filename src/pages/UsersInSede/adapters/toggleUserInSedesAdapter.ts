import api from "../../../services/api";

export const addUserToSedes = async (sedeIds: string[], userId: string): Promise<void> => {
  try {
    const userRes = await api.get(`/users/${userId}`);
    const currentSedes = userRes.data?.user?.sedes || [];
    const merged = Array.from(new Set([...currentSedes, ...sedeIds]));
    await api.put(`/users/${userId}/sedes`, { sedes: merged });
  } catch (error) {
    console.error("Error al agregar el usuario en las sedes:", error);
    throw new Error("No se pudieron actualizar las sedes al agregar el usuario.");
  }
};

export const removeUserFromSedes = async (sedeIds: string[], userId: string): Promise<void> => {
  try {
    const userRes = await api.get(`/users/${userId}`);
    const currentSedes = userRes.data?.user?.sedes || [];
    const filtered = currentSedes.filter((id: string) => !sedeIds.includes(id));
    await api.put(`/users/${userId}/sedes`, { sedes: filtered });
  } catch (error) {
    console.error("Error al eliminar el usuario de las sedes:", error);
    throw new Error("No se pudieron actualizar las sedes al remover el usuario.");
  }
};
