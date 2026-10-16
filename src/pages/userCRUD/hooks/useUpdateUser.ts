import { useState } from "react";
import { updateUser } from "../adapters/updateUser"; // Asegúrate de importar correctamente la función updateUser
import { User } from "../../../models/User";

interface UseUpdateUserReturn {
  loading: boolean;
  error: string | null;
  success: boolean;
  updateUserById: (userId: string, updatedUser: User) => Promise<void>;
}

export const useUpdateUser = (): UseUpdateUserReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const updateUserById = async (userId: string, updatedUser: User) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await updateUser(userId, updatedUser); // Llamamos a la función updateUser con el ID y los datos actualizados
      setSuccess(true); // Si la actualización es exitosa, establecemos success en true
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message); // Si hay un error, capturamos el mensaje
      } else {
        setError("Error desconocido"); // Manejamos errores desconocidos
      }
    } finally {
      setLoading(false); // Finalizamos el estado de carga
    }
  };

  return {
    loading,
    error,
    success,
    updateUserById,
  };
};
