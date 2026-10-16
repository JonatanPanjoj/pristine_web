// src/hooks/useToggleRoleStatus.ts

import { useState } from "react";
import { toggleRoleStatusInFirestore } from "../adapters/ToggleRoleStatusAdapter";

export const useToggleRoleStatus = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleStatus = async (roleId: string) => {
    setLoading(true);
    setError(null);
    try {
      const newStatus = await toggleRoleStatusInFirestore(roleId);
      return newStatus;
    } catch (err: any) {
      setError(err.message || "Error al cambiar el estado del rol.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { toggleStatus, loading, error };
};
