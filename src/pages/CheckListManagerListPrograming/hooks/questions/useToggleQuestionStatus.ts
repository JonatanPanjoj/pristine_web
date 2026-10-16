import { useState } from "react";
import { toggleQuestionStatusAdapter } from "../../adapters/questions/toggleQuestionStatusAdapter";

export const useToggleQuestionStatus = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleStatus = async (checklistId: string, questionId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await toggleQuestionStatusAdapter(checklistId, questionId);
      return result;
    } catch (err: any) {
      setError(err.message || "Error al cambiar el estado de la pregunta.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { toggleStatus, loading, error };
};

export default useToggleQuestionStatus;
