import { useState } from "react";
import { Area } from "../../../models/Area";
import { editAreaByIdAdapter } from "../adapters/editAreaByIdAdapter";

/**
 * Hook para editar un área.
 * Este hook se encarga de gestionar el estado de carga y errores al editar un área.
 *
 * @returns {
 *   loading: boolean,     // Indica si la edición está en proceso.
 *   error: string | null,   // Error si ocurre durante la edición.
 *   editArea: (area: Area) => Promise<{ success: boolean, message: string }> // Función para editar el área.
 * }
 */
export const useEditArea = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Función para editar un área.
   * Llama al adaptador para editar el área en Firestore.
   *
   * @param area - Objeto de tipo Area que contiene los datos del área a editar, incluyendo el id.
   * @returns Promise<{ success: boolean, message: string }> - Promesa que se resuelve cuando el área ha sido editada.
   */
  const editArea = async (area: Area): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    setError(null); // Limpiamos el error antes de la nueva edición

    try {
      // Llamamos al adaptador para editar el área
      await editAreaByIdAdapter(area);
      
      // Retornamos éxito y un mensaje
      return {
        success: true,
        message: "Área editada exitosamente",
      };
    } catch (error) {
      const errorMessage = (error as Error).message;
      setError(errorMessage);  // Guarda el mensaje de error en caso de que ocurra
      return {
        success: false,
        message: errorMessage || "Error al editar el área",
      };
    } finally {
      setLoading(false);  // Marca la operación como completa
    }
  };

  return {
    loading,    // Estado de carga
    error,      // Mensaje de error si ocurre algún problema
    editArea,   // Función para editar el área
  };
};
