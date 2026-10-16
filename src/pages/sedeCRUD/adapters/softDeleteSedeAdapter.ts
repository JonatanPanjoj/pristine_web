// src/pages/<sedeModule>/adapters/softDeleteSedeAdapter.ts
import { db } from "../../../services/firebase";
import { doc, setDoc, Timestamp } from "firebase/firestore";

import { FIRESTORE_COLLECTIONS } from "../../../constants/firestoreCollections";

// "Eliminar" una sede = desactivarla (is_enabled = false). No borra el documento.
export const softDeleteSedeAdapter = async (id: string) => {
  if (!id) {
    throw new Error("No se encontró el ID de la sede.");
  } // cierra if (!id)
  const sedeRef = doc(db, FIRESTORE_COLLECTIONS.CORE_SEDES, id);
  await setDoc(
    sedeRef,
    { is_enabled: false, updatedAt: Timestamp.now() },
    { merge: true }
  );
  return { id, is_enabled: false };
}; // cierra export const softDeleteSedeAdapter
