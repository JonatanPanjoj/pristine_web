// adapters/getChecklistByIdAdapter.ts
// Firestore collection: "checklists"
// Reemplaza: getQuestionByIdAdapter (ya no hay colección Questions separada)

import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../services/firebase";
import { Checklist } from "../../../models/Checklist";
import { FIRESTORE_COLLECTIONS } from "../../../constants/firestoreCollections";

export const getChecklistByIdAdapter = async (
  checklistId: string
): Promise<Checklist | null> => {
  try {
    const docRef = doc(db, FIRESTORE_COLLECTIONS.CHECKLIST_CHECKLISTS, checklistId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.warn(`No checklist found with ID: ${checklistId}`);
      return null;
    }

    return { id: docSnap.id, ...docSnap.data() } as Checklist;
  } catch (error) {
    console.error("Error fetching checklist:", error);
    throw new Error("Could not fetch checklist.");
  }
};
