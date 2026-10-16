import api from "../../../../services/api";
import { ChecklistQuestion } from "../../../../models/ChecklistQuestion";

/**
 * Retorna las preguntas habilitadas (isEnabled: true) de un checklist.
 * Lee directamente del array embebido checklist.questions[].
 *
 * @param checklistId - ID del checklist.
 * @returns Promise<ChecklistQuestion[]>
 */
export const getEnabledQuestionsAdapter = async (
  checklistId: string
): Promise<ChecklistQuestion[]> => {
  try {
    const res = await api.get('/checklists');
    const lists = res.data?.checklists || [];
    const found = lists.find((l: any) => l.id === checklistId || l._id === checklistId);

    if (!found) {
      throw new Error("Checklist no encontrado.");
    }

    const questions: ChecklistQuestion[] = found.questions || found.items || [];
    return questions.filter((q) => q.isEnabled);
  } catch (error) {
    console.error("Error al obtener las preguntas habilitadas:", error);
    throw new Error("No se pudieron obtener las preguntas habilitadas.");
  }
};
