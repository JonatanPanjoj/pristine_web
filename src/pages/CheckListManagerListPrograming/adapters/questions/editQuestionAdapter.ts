import api from "../../../../services/api";
import { ChecklistQuestion } from "../../../../models/ChecklistQuestion";

/**
 * Edita una pregunta existente dentro del array embebido checklist.questions[].
 * Localiza la pregunta por questionId y reemplaza solo los campos indicados.
 *
 * @param checklistId - ID del checklist que contiene la pregunta.
 * @param questionId - ID de la pregunta a editar.
 * @param updates - Campos a actualizar (parcial, sin el id).
 * @returns Promise<void>
 */

export const editQuestionAdapter = async (
  checklistId: string,
  questionId: string,
  updates: Partial<Omit<ChecklistQuestion, "id">>
): Promise<void> => {
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

    questions[idx] = { ...questions[idx], ...updates };

    await api.put(`/checklists/${checklistId}`, {
      questions,
      items: questions,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error al editar la pregunta:", error);
    throw new Error("No se pudo editar la pregunta.");
  }
};
