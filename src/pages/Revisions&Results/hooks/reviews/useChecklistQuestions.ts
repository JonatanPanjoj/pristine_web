// hooks/useChecklistQuestions.ts
// Reemplaza: useEnabledQuestions.ts (antiguo)

import { useState, useEffect } from "react";
import { getEnabledQuestionsAdapter } from "../../adapters/reviews/getEnabledQuestionsAdapter";
import { ChecklistQuestion } from "../../../../models/ChecklistQuestion";

interface UseChecklistQuestionsReturn {
  questions: ChecklistQuestion[];
  loading: boolean;
  error: string | null;
}

const useChecklistQuestions = (checklistId: string): UseChecklistQuestionsReturn => {
  const [questions, setQuestions] = useState<ChecklistQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!checklistId) {
      setLoading(false);
      return;
    }

    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getEnabledQuestionsAdapter(checklistId);
        setQuestions(result);
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

export default useChecklistQuestions;
