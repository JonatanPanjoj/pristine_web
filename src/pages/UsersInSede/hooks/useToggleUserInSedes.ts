import { useState } from 'react';
import { addUserToSedes, removeUserFromSedes } from '../adapters/toggleUserInSedesAdapter';

/**
 * Hook personalizado para manejar la adición o eliminación de un `userId` en las `user_ids` de varias sedes.
 *
 * @returns Object - Devuelve un objeto con `addUserToSedes`, `removeUserFromSedes`, `loading`, y `error`.
 */
const useToggleUserInSedes = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Función para agregar un `userId` en varias sedes.
   *
   * @param sedeIds - Array de IDs de sedes a actualizar.
   * @param userId - ID del usuario a agregar en cada sede.
   * @returns Promise<void> - Promesa que se resuelve cuando la operación ha terminado.
   */
  const addUser = async (sedeIds: string[], userId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await addUserToSedes(sedeIds, userId);
    } catch (error) {
      console.error("Error al agregar el usuario en sedes:", error);
      setError("No se pudieron actualizar las sedes al agregar el usuario.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Función para eliminar un `userId` de varias sedes.
   *
   * @param sedeIds - Array de IDs de sedes a actualizar.
   * @param userId - ID del usuario a eliminar en cada sede.
   * @returns Promise<void> - Promesa que se resuelve cuando la operación ha terminado.
   */
  const removeUser = async (sedeIds: string[], userId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await removeUserFromSedes(sedeIds, userId);
    } catch (error) {
      console.error("Error al eliminar el usuario de las sedes:", error);
      setError("No se pudieron actualizar las sedes al eliminar el usuario.");
    } finally {
      setLoading(false);
    }
  };

  return { addUser, removeUser, loading, error };
};

export default useToggleUserInSedes;
