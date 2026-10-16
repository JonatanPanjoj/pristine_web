// adapters/toggleQuestionStatusAdapter.ts
// Reemplaza: toggleQuestionStatus.ts (antiguo)
// Cambio: ya no hace getDoc + setDoc a la colección "Questions"
//         invierte isEnabled en el array questions[] del documento "checklists"
//         con un solo updateDoc

import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../services/firebase";
import { Checklist } from "../../../../models/Checklist";
import { FIRESTORE_COLLECTIONS } from "../../../../constants/firestoreCollections";

export const toggleQuestionStatusAdapter = async (
  checklistId: string,
  questionId: string
): Promise<{ questionId: string; isEnabled: boolean }> => {
  try {
    const snap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.CHECKLIST_CHECKLISTS, checklistId));
    if (!snap.exists()) throw new Error(`Checklist not found: ${checklistId}`);

    const checklist = { id: snap.id, ...snap.data() } as Checklist;

    const question = checklist.questions.find((q) => q.id === questionId);
    if (!question) throw new Error(`Question not found: ${questionId}`);

    const newStatus = !question.isEnabled;

    const updatedQuestions = checklist.questions.map((q) =>
      q.id === questionId ? { ...q, isEnabled: newStatus } : q
    );

    await updateDoc(doc(db, FIRESTORE_COLLECTIONS.CHECKLIST_CHECKLISTS, checklistId), {
      questions: updatedQuestions,
    });

    return { questionId, isEnabled: newStatus };
  } catch (error) {
    console.error("Error toggling question status:", error);
    throw new Error("Could not toggle question status.");
  }
};
