// adapters/createQuestionAdapter.ts
// Reemplaza: createNewQuestionAdapter.ts (antiguo)
// Cambio: ya no hace setDoc a la colección "Questions"
//         agrega la pregunta al array questions[] del documento "checklists"
//         con un solo updateDoc

import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../services/firebase";
import { Checklist } from "../../../../models/Checklist";
import { ChecklistQuestion } from "../../../../models/ChecklistQuestion";
import { FIRESTORE_COLLECTIONS } from "../../../../constants/firestoreCollections";

export const createQuestionAdapter = async (
  checklistId: string,
  questionData: Omit<ChecklistQuestion, "id">
): Promise<ChecklistQuestion> => {
  try {
    const snap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.CHECKLIST_CHECKLISTS, checklistId));
    if (!snap.exists()) throw new Error(`Checklist not found: ${checklistId}`);

    const checklist = { id: snap.id, ...snap.data() } as Checklist;

    // Validar texto único dentro del checklist
    const duplicate = checklist.questions.find(
      (q) =>
        q.questionText.trim().toLowerCase() ===
        questionData.questionText.trim().toLowerCase()
    );
    if (duplicate) throw new Error("Question text already exists in this checklist.");

    const newQuestion: ChecklistQuestion = {
      ...questionData,
      id: crypto.randomUUID(),
    };

    await updateDoc(doc(db, FIRESTORE_COLLECTIONS.CHECKLIST_CHECKLISTS, checklistId), {
      questions: [...checklist.questions, newQuestion],
    });

    return newQuestion;
  } catch (error) {
    console.error("Error creating question:", error);
    throw new Error("Could not create question.");
  }
};
