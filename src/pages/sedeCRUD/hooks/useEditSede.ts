import { useState } from "react";
import { Sede } from "../../../models/Sede";
import { editSedeByIdAdapter } from "../adapters/editSedeByIdAdapter";
import { loadAndUpdateSedes } from "../../../services/sedeStorage";

/**
 * Hook para editar una sede.
 * Este hook se encarga de gestionar el estado de carga y errores al editar una sede.
 *
 * @returns {
 *   loading: boolean,     // Indica si la edición está en proceso.
 *   error: string | null,   // Error si ocurre durante la edición.
 *   editSede: (sede: Sede) => Promise<{ success: boolean, message: string }> // Función para editar la sede.
 * }
 */
export const useEditSede = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Función para editar una sede.
   * Llama al adaptador para editar la sede en Firestore.
   *
   * @param sede - Objeto de tipo Sede que contiene los datos de la sede a editar, incluyendo el id.
   * @returns Promise<{ success: boolean, message: string }> - Promesa que se resuelve cuando la sede ha sido editada.
   */
  const editSede = async (sede: Sede): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    setError(null); // Limpiamos el error antes de la nueva edición

    try {
      // Llamamos al adaptador para editar la sede
      await editSedeByIdAdapter(sede);
      
      // Retornamos éxito y un mensaje
      loadAndUpdateSedes();
      return {
        success: true,
        message: "Sede editada exitosamente",
      };
    } catch (error) {
      const errorMessage = (error as Error).message;
      setError(errorMessage);  // Guarda el mensaje de error en caso de que ocurra
      return {
        success: false,
        message: errorMessage || "Error al editar la sede",
      };
    } finally {
      setLoading(false);  // Marca la operación como completa
    }
  };

  return {
    loading,   // Estado de carga (renombrado a 'loading' en lugar de 'isLoading')
    error,     // Mensaje de error si ocurre algún problema
    editSede,  // Función para editar la sede
  };
};
