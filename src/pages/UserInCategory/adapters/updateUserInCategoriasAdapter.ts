import api from "../../../services/api";

export const addUserToCategorias = async (categoriaIds: string[], userId: string): Promise<void> => {
  try {
    const userRes = await api.get(`/users/${userId}`);
    const currentCats = userRes.data?.user?.categories || [];
    const merged = Array.from(new Set([...currentCats, ...categoriaIds]));
    await api.put(`/users/${userId}/categories`, { categories: merged });
  } catch (error) {
    console.error("Error al agregar el usuario en las categorías:", error);
    throw new Error("No se pudieron actualizar las categorías al agregar el usuario.");
  }
};

export const removeUserFromCategorias = async (categoriaIds: string[], userId: string): Promise<void> => {
  try {
    const userRes = await api.get(`/users/${userId}`);
    const currentCats = userRes.data?.user?.categories || [];
    const filtered = currentCats.filter((id: string) => !categoriaIds.includes(id));
    await api.put(`/users/${userId}/categories`, { categories: filtered });
  } catch (error) {
    console.error("Error al eliminar el usuario de las categorías:", error);
    throw new Error("No se pudieron actualizar las categorías al remover el usuario.");
  }
};
