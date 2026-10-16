// src/pages/userCRUD/hooks/useDeactivateAccount.ts
import { useState } from "react";
import { deactivateAccount } from "../adapters/ProfileAdapter";

interface UseDeactivateAccountReturn {
  loading: boolean;
  error: string | null;
  deactivate: (userId: string) => Promise<boolean>;
}

export const useDeactivateAccount = (): UseDeactivateAccountReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deactivate = async (userId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await deactivateAccount(userId);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al desactivar la cuenta.");
      return false;
    } finally {
      setLoading(false);
    } // cierra finally
  }; // cierra const deactivate

  return { loading, error, deactivate };
}; // cierra export const useDeactivateAccount
