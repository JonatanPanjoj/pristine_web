// adapters/editQuestionAdapter.ts
// Reemplaza: editQuestionByIdAdapter.ts (antiguo)
// Cambio: ya no hace query + setDoc a la colección "Questions"
//         edita el array questions[] del documento "checklists"
//         con un solo updateDoc

import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../services/firebase";
import { Checklist } from "../../../../models/Checklist";
import { ChecklistQuestion } from "../../../../models/ChecklistQuestion";
import { FIRESTORE_COLLECTIONS } from "../../../../constants/firestoreCollections";

export const editQuestionAdapter = async (
  checklistId: string,
  questionId: string,
  updates: Partial<Omit<ChecklistQuestion, "id">>
): Promise<void> => {
  try {
    const snap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.CHECKLIST_CHECKLISTS, checklistId));
    if (!snap.exists()) throw new Error(`Checklist not found: ${checklistId}`);

    const checklist = { id: snap.id, ...snap.data() } as Checklist;

    // Validar texto único si se está cambiando
    if (updates.questionText) {
      const duplicate = checklist.questions.find(
        (q) =>
          q.id !== questionId &&
          q.questionText.trim().toLowerCase() ===
            updates.questionText!.trim().toLowerCase()
      );
      if (duplicate) throw new Error("Question text already exists in this checklist.");
    }

    const question = checklist.questions.find((q) => q.id === questionId);
    if (!question) throw new Error(`Question not found: ${questionId}`);

    const updatedQuestions = checklist.questions.map((q) =>
      q.id === questionId ? { ...q, ...updates } : q
    );

    await updateDoc(doc(db, FIRESTORE_COLLECTIONS.CHECKLIST_CHECKLISTS, checklistId), {
      questions: updatedQuestions,
    });
  } catch (error) {
    console.error("Error editing question:", error);
    throw new Error("Could not edit question.");
  }
};
