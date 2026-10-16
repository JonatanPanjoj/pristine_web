import api from "../../../../services/api";
import { ChecklistQuestion } from "../../../../models/ChecklistQuestion";

/**
 * Alterna el estado isEnabled de una pregunta dentro del array embebido checklist.questions[].
 *
 * @param checklistId - ID del checklist que contiene la pregunta.
 * @param questionId - ID de la pregunta a alternar.
 * @returns El id de la pregunta y su nuevo estado isEnabled.
 */
export const toggleQuestionStatusAdapter = async (
  checklistId: string,
  questionId: string
): Promise<{ questionId: string; isEnabled: boolean }> => {
  try {
    const res = await api.get('/checklists');
    const lists = res.data?.checklists || [];
    const found = lists.find((l: any) => l.id === checklistId || l._id === checklistId);

    if (!found) {
      throw new Error("Checklist no encontrado.");
    }

    const questions: ChecklistQuestion[] = found.questions || found.items || [];
    const idx = questions.findIndex((q) => q.id === questionId);

    if (idx === -1) {
      throw new Error("Pregunta no encontrada.");
    }

    questions[idx] = { ...questions[idx], isEnabled: !questions[idx].isEnabled };
    const newStatus = questions[idx].isEnabled;

    await api.put(`/checklists/${checklistId}`, {
      questions,
      items: questions,
      updatedAt: new Date().toISOString(),
    });

    return { questionId, isEnabled: newStatus };
  } catch (error) {
    console.error("Error al alternar el estado de la pregunta:", error);
    throw new Error("No se pudo alternar el estado de la pregunta.");
  }
};
