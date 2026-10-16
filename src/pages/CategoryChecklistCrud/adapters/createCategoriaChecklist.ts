import api from "../../../services/api";
import { Categoria_Checklist } from "../../../models/Categoria_Checklist";

export const createCategoriaChecklist = async (
  categoria: Omit<Categoria_Checklist, 'id' | 'updatedAt'> | Omit<Categoria_Checklist, 'id'>
): Promise<string> => {
  try {
    const response = await api.post('/checklist-categories', categoria);
    if (response.data && response.data.success) {
      return response.data.category.id;
    }
    throw new Error(response.data?.message || "No se pudo crear la categoría.");
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "No se pudo crear la categoría.");
  }
};
