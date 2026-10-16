// hooks/useEditQuestion.ts
// Reemplaza: useEditQuestion.ts (antiguo)
// Cambio: editQuestion recibe checklistId + questionId + updates parciales
//         ya no recibe un objeto Question completo con id

import { useState } from "react";
import { editQuestionAdapter } from "../../adapters/reviews/editQuestionAdapter";
import { ChecklistQuestion } from "../../../../models/ChecklistQuestion";

interface UseEditQuestionReturn {
  editQuestion: (
    checklistId: string,
    questionId: string,
    updates: Partial<Omit<ChecklistQuestion, "id">>
  ) => Promise<{ success: boolean; message: string }>;
  loading: boolean;
  error: string | null;
}

const useEditQuestion = (): UseEditQuestionReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editQuestion = async (
    checklistId: string,
    questionId: string,
    updates: Partial<Omit<ChecklistQuestion, "id">>
  ) => {
    setLoading(true);
    setError(null);
    try {
      await editQuestionAdapter(checklistId, questionId, updates);
      return { success: true, message: "Question updated successfully." };
    } catch (err) {
      const msg = (err as Error).message || "Could not update question.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  return { editQuestion, loading, error };
};

export default useEditQuestion;
