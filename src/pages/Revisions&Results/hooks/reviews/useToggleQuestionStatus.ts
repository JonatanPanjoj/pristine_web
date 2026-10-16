// hooks/useToggleQuestionStatus.ts
// Reemplaza: toggleQuestionStatus.ts (antiguo hook)
// Cambio: toggleStatus recibe checklistId + questionId
//         retorna { questionId, isEnabled } en vez de solo el nuevo status

import { useState } from "react";
import { toggleQuestionStatusAdapter } from "../../adapters/reviews/toggleQuestionStatusAdapter";

interface UseToggleQuestionStatusReturn {
  toggleStatus: (
    checklistId: string,
    questionId: string
  ) => Promise<{ questionId: string; isEnabled: boolean } | null>;
  loading: boolean;
  error: string | null;
}

const useToggleQuestionStatus = (): UseToggleQuestionStatusReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleStatus = async (checklistId: string, questionId: string) => {
    setLoading(true);
    setError(null);
    try {
      return await toggleQuestionStatusAdapter(checklistId, questionId);
    } catch (err) {
      setError((err as Error).message || "Could not toggle question status.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { toggleStatus, loading, error };
};

export default useToggleQuestionStatus;
