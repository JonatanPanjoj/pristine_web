import { useState } from "react";
import { ChecklistQuestion } from "../../../../models/ChecklistQuestion";
import { editQuestionAdapter } from "../../adapters/questions/editQuestionAdapter";

export const useEditQuestion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editQuestion = async (
    checklistId: string,
    questionId: string,
    updates: Partial<Omit<ChecklistQuestion, "id">>
  ): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    setError(null);
    try {
      await editQuestionAdapter(checklistId, questionId, updates);
      return { success: true, message: "Pregunta editada exitosamente" };
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      return { success: false, message: errorMessage || "Error al editar la pregunta" };
    } finally {
      setLoading(false);
    }
  };

  return { editQuestion, loading, error };
};
