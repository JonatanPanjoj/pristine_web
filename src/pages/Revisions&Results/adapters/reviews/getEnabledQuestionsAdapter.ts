// adapters/getEnabledQuestionsAdapter.ts
// Reemplaza: getEnabledQuestionsAdapter.ts (antiguo)
// Cambio: ya no consulta la colección "Questions"
//         lee el array questions[] embebido en el documento "checklists"

import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../../services/firebase";
import { Checklist } from "../../../../models/Checklist";
import { ChecklistQuestion } from "../../../../models/ChecklistQuestion";
import { FIRESTORE_COLLECTIONS } from "../../../../constants/firestoreCollections";

export const getEnabledQuestionsAdapter = async (
  checklistId: string
): Promise<ChecklistQuestion[]> => {
  try {
    const snap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.CHECKLIST_CHECKLISTS, checklistId));

    if (!snap.exists()) {
      console.warn(`Checklist not found: ${checklistId}`);
      return [];
    }

    const checklist = { id: snap.id, ...snap.data() } as Checklist;
    return checklist.questions.filter((q) => q.isEnabled);
  } catch (error) {
    console.error("Error fetching enabled questions:", error);
    throw new Error("Could not fetch enabled questions.");
  }
};
