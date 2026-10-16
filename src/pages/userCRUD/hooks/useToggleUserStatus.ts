import { useState } from "react";
import { toggleUserStatus } from "../adapters/userStatusToggle"; // Importar la función del adaptador
import { User } from "../../../models/User";

interface UseToggleUserStatusReturn {
  toggleStatus: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  updatedUser: Partial<User> | null;
}

export const useToggleUserStatus = (): UseToggleUserStatusReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedUser, setUpdatedUser] = useState<Partial<User> | null>(null);

  const toggleStatus = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const user = await toggleUserStatus(id); // Llamada a la función del adaptador
      setUpdatedUser(user); // Guardar el usuario actualizado
    } catch (err: any) {
      setError(err.message || "Error al actualizar el estado del usuario");
    } finally {
      setLoading(false);
    }
  };

  return { toggleStatus, loading, error, updatedUser };
};
