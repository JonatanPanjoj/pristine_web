// src/pages/CategoryChecklist/hooks/useToggleUserInCategorias.ts
import { useState } from 'react';
import { addUserToCategorias, removeUserFromCategorias } from '../adapters/updateUserInCategoriasAdapter';

/**
 * Hook personalizado para manejar la adición o eliminación de un `userId` en el campo `users_id` de varias categorías.
 *
 * @returns Object - Devuelve un objeto con `addUserToCategorias`, `removeUserFromCategorias`, `loading`, y `error`.
 */
const useToggleUserInCategorias = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Función para agregar un `userId` en varias categorías.
   *
   * @param categoriaIds - Array de IDs de categorías a actualizar.
   * @param userId - ID del usuario a agregar en cada categoría.
   * @returns Promise<void> - Promesa que se resuelve cuando la operación ha terminado.
   */
  const addUser = async (categoriaIds: string[], userId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await addUserToCategorias(categoriaIds, userId);
    } catch (error) {
      console.error("Error al agregar el usuario en categorías:", error);
      setError("No se pudieron actualizar las categorías al agregar el usuario.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Función para eliminar un `userId` de varias categorías.
   *
   * @param categoriaIds - Array de IDs de categorías a actualizar.
   * @param userId - ID del usuario a eliminar en cada categoría.
   * @returns Promise<void> - Promesa que se resuelve cuando la operación ha terminado.
   */
  const removeUser = async (categoriaIds: string[], userId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await removeUserFromCategorias(categoriaIds, userId);
    } catch (error) {
      console.error("Error al eliminar el usuario de las categorías:", error);
      setError("No se pudieron actualizar las categorías al eliminar el usuario.");
    } finally {
      setLoading(false);
    }
  };

  return { addUser, removeUser, loading, error };
};

export default useToggleUserInCategorias;
