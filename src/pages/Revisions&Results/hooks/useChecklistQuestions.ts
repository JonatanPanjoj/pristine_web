// hooks/useChecklistQuestions.ts
// Reemplaza: useEnabledQuestions
// Cambios:   ya no consulta la colección Questions
//            obtiene las preguntas del array embebido en el documento Checklist
//            filtra isEnabled localmente — una sola lectura a Firestore

import { useState, useEffect } from "react";
import { getChecklistByIdAdapter } from "../adapters/getChecklistByIdAdapter";
import { ChecklistQuestion } from "../../../models/ChecklistQuestion";

interface UseChecklistQuestionsReturn {
  questions: ChecklistQuestion[];
  loading: boolean;
  error: string | null;
}

export const useChecklistQuestions = (
  checklistId: string
): UseChecklistQuestionsReturn => {
  const [questions, setQuestions] = useState<ChecklistQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!checklistId) return;

    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const checklist = await getChecklistByIdAdapter(checklistId);
        // Filtra isEnabled localmente — sin query adicional
        setQuestions(checklist?.questions.filter((q) => q.isEnabled) ?? []);
      } catch (err) {
        setError("Could not load questions.");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [checklistId]);

  return { questions, loading, error };
};
