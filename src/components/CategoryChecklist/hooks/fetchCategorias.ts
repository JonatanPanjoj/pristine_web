import { getAllCategoriasAdapter } from "../adapters/getAllCategoriasAdapter";
import { Categoria_Checklist } from "../../../models/Categoria_Checklist";

/**
 * Función para obtener todas las categorías.
 * 
 * @returns Promise con las categorías o un mensaje de error.
 */
const fetchCategorias = async (): Promise<{ categorias: Categoria_Checklist[] | null, error: string | null }> => {
  try {
    const fetchedCategorias = await getAllCategoriasAdapter();
    return { categorias: fetchedCategorias, error: null };
  } catch (err) {
    return { categorias: null, error: "No se pudieron obtener las categorías." };
  }
};

export default fetchCategorias;
