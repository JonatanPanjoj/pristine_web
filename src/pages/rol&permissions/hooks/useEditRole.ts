import { useState } from 'react';
import { Role } from '../../../models/Role';
import { editRoleInDatabase } from '../adapters/editRoleAdapter';

export const useEditRole = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const editRole = async (role: Role) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Llamada al adaptador para actualizar el rol
      console.log("mellame")
      await editRoleInDatabase(role);
      setSuccess(true);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error desconocido al editar el rol.');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    editRole,
    loading,
    error,
    success,
  };
};
