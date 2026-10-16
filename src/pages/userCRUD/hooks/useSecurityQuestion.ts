// src/pages/userCRUD/hooks/useSecurityQuestion.ts
import { useState } from "react";
import { updateSecurityQuestion } from "../adapters/ProfileAdapter";
import useEncryptDecrypt from "../../../hooks/encrypt/useEncryptDecrypt";

interface UseSecurityQuestionReturn {
  loading: boolean;
  error: string | null;
  success: boolean;
  submit: (
    userId: string,
    username: string,
    question: string,
    answer: string
  ) => Promise<boolean>;
  reset: () => void;
}

export const useSecurityQuestion = (): UseSecurityQuestionReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { encrypt } = useEncryptDecrypt();

  const submit = async (
    userId: string,
    username: string,
    question: string,
    answer: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      // La respuesta se cifra con el mismo esquema que la contraseña
      const encryptedAnswer = encrypt(answer, username);
      await updateSecurityQuestion(userId, question, encryptedAnswer);
      setSuccess(true);
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al guardar la pregunta secreta."
      );
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
}; // cierra export const useSecurityQuestion
