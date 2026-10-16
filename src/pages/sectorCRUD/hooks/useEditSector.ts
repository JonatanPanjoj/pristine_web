import { useState } from "react";
import { Sector } from "../../../models/Sector";
import { editSectorByIdAdapter } from "../adapters/editSectorByIdAdapter";

/**
 * Hook para editar un sector.
 * Este hook se encarga de gestionar el estado de carga y errores al editar un sector.
 *
 * @returns {
 *   loading: boolean,     // Indica si la edición está en proceso.
 *   error: string | null,   // Error si ocurre durante la edición.
 *   editSector: (sector: Sector) => Promise<{ success: boolean, message: string }> // Función para editar el sector.
 * }
 */
export const useEditSector = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Función para editar un sector.
   * Llama al adaptador para editar el sector en Firestore.
   *
   * @param sector - Objeto de tipo Sector que contiene los datos del sector a editar, incluyendo el id.
   * @returns Promise<{ success: boolean, message: string }> - Promesa que se resuelve cuando el sector ha sido editado.
   */
  const editSector = async (sector: Sector): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    setError(null); // Limpiamos el error antes de la nueva edición

    try {
      // Llamamos al adaptador para editar el sector
      await editSectorByIdAdapter(sector);
      
      // Retornamos éxito y un mensaje
      return {
        success: true,
        message: "Sector editado exitosamente",
      };
    } catch (error) {
      const errorMessage = (error as Error).message;
      setError(errorMessage);  // Guarda el mensaje de error en caso de que ocurra
      return {
        success: false,
        message: errorMessage || "Error al editar el sector",
      };
    } finally {
      setLoading(false);  // Marca la operación como completa
    }
  };

  return {
    loading,    // Estado de carga
    error,      // Mensaje de error si ocurre algún problema
    editSector, // Función para editar el sector
  };
};
