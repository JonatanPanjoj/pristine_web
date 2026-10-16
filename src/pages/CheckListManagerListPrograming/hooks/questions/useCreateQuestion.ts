import { useState } from "react";
import { ChecklistQuestion } from "../../../../models/ChecklistQuestion";
import { createQuestionAdapter } from "../../adapters/questions/createQuestionAdapter";

const useCreateQuestion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addNewQuestion = async (
    checklistId: string,
    questionData: Omit<ChecklistQuestion, "id">
  ): Promise<{ newQuestion?: ChecklistQuestion; success: boolean; message: string }> => {
    setLoading(true);
    setError(null);
    try {
      const newQuestion = await createQuestionAdapter(checklistId, questionData);
      return { newQuestion, success: true, message: "Pregunta creada exitosamente" };
    } catch (err) {
      setError("Error al crear la pregunta.");
      return { success: false, message: "Error al crear la pregunta" };
    } finally {
      setLoading(false);
    }
  };

  return { addNewQuestion, loading, error };
};

export default useCreateQuestion;
