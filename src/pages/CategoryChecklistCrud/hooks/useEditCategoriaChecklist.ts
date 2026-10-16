import { useState } from "react";
import { Categoria_Checklist } from "../../../models/Categoria_Checklist";
import { editCategoriaByIdAdapter } from "../adapters/editCategoriaByIdAdapter";

/**
 * Hook para editar una categoría en Firestore.
 * Este hook se encarga de gestionar el estado de carga y errores al editar una categoría.
 *
 * @returns {
 *   loading: boolean,     // Indica si la edición está en proceso.
 *   error: string | null, // Error si ocurre durante la edición.
 *   editCategoriaChecklist: (categoria: Categoria_Checklist) => Promise<{ success: boolean, message: string }>
 * }
 */
export const useEditCategoriaChecklist = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Función para editar una categoría.
   * Llama al adaptador para editar la categoría en Firestore.
   *
   * @param categoria - Objeto de tipo Categoria_Checklist que contiene los datos de la categoría a editar, incluyendo el id.
   * @returns Promise<{ success: boolean; message: string }> - Promesa que se resuelve cuando la categoría ha sido editada.
   */
  const editCategoriaChecklist = async (categoria: Categoria_Checklist): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    setError(null); // Limpiamos el error antes de la nueva edición

    try {
      // Llamamos al adaptador para editar la categoría
      await editCategoriaByIdAdapter(categoria);
      
      // Retornamos éxito y un mensaje
      return {
        success: true,
        message: "Categoría editada exitosamente",
      };
    } catch (error) {
      const errorMessage = (error as Error).message;
      setError(errorMessage);  // Guarda el mensaje de error en caso de que ocurra
      return {
        success: false,
        message: errorMessage || "Error al editar la categoría",
      };
    } finally {
      setLoading(false);  // Marca la operación como completa
    }
  };

  return {
    loading,    // Estado de carga
    error,      // Mensaje de error si ocurre algún problema
    editCategoriaChecklist,   // Función para editar la categoría
  };
};
