// hooks/useCreateQuestion.ts
// Reemplaza: useCreateQuestion.ts (antiguo)
// Cambio: addNewQuestion recibe checklistId como primer parámetro
//         ya no usa Omit<Question, 'id'> del modelo antiguo

import { useState } from "react";
import { createQuestionAdapter } from "../../adapters/reviews/createQuestionAdapter";
import { ChecklistQuestion } from "../../../../models/ChecklistQuestion";

interface UseCreateQuestionReturn {
  addNewQuestion: (
    checklistId: string,
    questionData: Omit<ChecklistQuestion, "id">
  ) => Promise<{ success: boolean; newQuestion?: ChecklistQuestion; message: string }>;
  loading: boolean;
  error: string | null;
}

const useCreateQuestion = (): UseCreateQuestionReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addNewQuestion = async (
    checklistId: string,
    questionData: Omit<ChecklistQuestion, "id">
  ) => {
    setLoading(true);
    setError(null);
    try {
      const newQuestion = await createQuestionAdapter(checklistId, questionData);
      return { success: true, newQuestion, message: "Question created successfully." };
    } catch (err) {
      const msg = (err as Error).message || "Could not create question.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  return { addNewQuestion, loading, error };
};

export default useCreateQuestion;
