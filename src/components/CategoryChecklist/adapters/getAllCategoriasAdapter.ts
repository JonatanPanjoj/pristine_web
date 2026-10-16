import api from "../../../services/api";
import { Categoria_Checklist } from "../../../models/Categoria_Checklist";

/**
 * Adapter para obtener todas las categorías habilitadas desde la API.
 * @returns Promise<Categoria_Checklist[]> - Promesa que se resuelve con un array de categorías habilitadas.
 */
export const getAllCategoriasAdapter = async (): Promise<Categoria_Checklist[]> => {
  try {
    const response = await api.get('/checklist-categories');
    const categories: Categoria_Checklist[] = (response.data?.categories || [])
      .map((c: any) => ({
        ...c,
        id: c.id || c._id,
        is_enabled: c.is_enabled !== false && c.status !== false,
        status: c.is_enabled !== false && c.status !== false,
      }))
      .filter((c: Categoria_Checklist) => c.is_enabled);

    return categories;
  } catch (error) {
    console.error("Error al obtener las categorías habilitadas:", error);
    throw new Error("No se pudieron obtener las categorías habilitadas.");
  }
};
