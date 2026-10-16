import { useState } from "react";
import { Role } from "../../../models/Role";
import { addRoleToDatabase } from "../adapters/RoleAddAdapter";

export const useAddRoleToDatabase = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const addNewRole = async (role: Role) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await addRoleToDatabase(role);
      setSuccess(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error desconocido.");
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    addNewRole,
    loading,
    error,
    success,
  };
};
