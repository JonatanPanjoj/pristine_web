// src/pages/userCRUD/hooks/useChangePassword.ts
import { useState } from "react";
import { changePassword } from "../adapters/ProfileAdapter";
import useEncryptDecrypt from "../../../hooks/encrypt/useEncryptDecrypt";

interface UseChangePasswordReturn {
  loading: boolean;
  error: string | null;
  success: boolean;
  submit: (
    userId: string,
    username: string,
    currentPassword: string,
    newPassword: string
  ) => Promise<boolean>;
  reset: () => void;
}

export const useChangePassword = (): UseChangePasswordReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { encrypt } = useEncryptDecrypt();

  const submit = async (
    userId: string,
    username: string,
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      // Mismo esquema de cifrado que usa la creación de usuario:
      // encrypt(valor, username)
      const encryptedCurrent = encrypt(currentPassword, username);
      const encryptedNew = encrypt(newPassword, username);

      await changePassword(userId, encryptedCurrent, encryptedNew);
      setSuccess(true);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cambiar la contraseña.");
      return false;
    } finally {
      setLoading(false);
    } // cierra finally
  }; // cierra const submit

  const reset = () => {
    setError(null);
    setSuccess(false);
  }; // cierra const reset

  return { loading, error, success, submit, reset };
}; // cierra export const useChangePassword
