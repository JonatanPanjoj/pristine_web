import api from "../../../services/api";
import { Categoria_Checklist } from "../../../models/Categoria_Checklist";

export const editCategoriaByIdAdapter = async (categoria: Categoria_Checklist): Promise<void> => {
  try {
    const response = await api.put(`/checklist-categories/${categoria.id}`, categoria);
    if (!response.data || !response.data.success) {
      throw new Error(response.data?.message || "No se pudo actualizar la categoría.");
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "No se pudo actualizar la categoría.");
  }
};
