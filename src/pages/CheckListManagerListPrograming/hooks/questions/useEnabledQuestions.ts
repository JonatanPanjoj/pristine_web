import { useEffect, useState } from "react";
import { ChecklistQuestion } from "../../../../models/ChecklistQuestion";
import { getEnabledQuestionsAdapter } from "../../adapters/questions/getEnabledQuestionsAdapter";

const useEnabledQuestions = (checklistId: string) => {
  const [questions, setQuestions] = useState<ChecklistQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!checklistId) return;

    const fetchEnabledQuestions = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedQuestions = await getEnabledQuestionsAdapter(checklistId);
        setQuestions(fetchedQuestions);
      } catch (err) {
        setError("Error al cargar las preguntas habilitadas.");
      } finally {
        setLoading(false);
      }
    };

    fetchEnabledQuestions();
  }, [checklistId]);

  return { questions, loading, error };
};

export default useEnabledQuestions;
