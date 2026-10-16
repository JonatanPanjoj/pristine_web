import api from "../../../../services/api";
import { ChecklistQuestion } from "../../../../models/ChecklistQuestion";
import { v4 as uuidv4 } from "uuid";

/**
 * Agrega una nueva pregunta al array embebido checklist.questions[].
 *
 * @param checklistId - ID del checklist al que pertenece la pregunta.
 * @param questionData - Datos de la pregunta sin el id.
 * @returns Promise<ChecklistQuestion> - La pregunta creada con su id generado.
 */
export const createQuestionAdapter = async (
  checklistId: string,
  questionData: Omit<ChecklistQuestion, "id">
): Promise<ChecklistQuestion> => {
  try {
    const res = await api.get('/checklists');
    const lists = res.data?.checklists || [];
    const found = lists.find((l: any) => l.id === checklistId || l._id === checklistId);

    if (!found) {
      throw new Error("Checklist no encontrado.");
    }

    const newQuestion: ChecklistQuestion = {
      ...questionData,
      id: uuidv4(),
    };

    const currentQuestions = found.questions || found.items || [];
    const updatedQuestions = [...currentQuestions, newQuestion];

    await api.put(`/checklists/${checklistId}`, {
      questions: updatedQuestions,
      items: updatedQuestions,
      updatedAt: new Date().toISOString(),
    });

    return newQuestion;
  } catch (error) {
    console.error("Error al crear la pregunta:", error);
    throw new Error("No se pudo crear la pregunta.");
  }
};
