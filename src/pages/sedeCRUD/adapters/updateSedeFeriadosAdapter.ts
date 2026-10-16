// src/pages/<sedeModule>/adapters/updateSedeFeriadosAdapter.ts
import { db } from "../../../services/firebase";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { FIRESTORE_COLLECTIONS } from "../../../constants/firestoreCollections";

// Guarda (merge) el arreglo de fechas feriadas de una sede. No toca los demás campos.
export const updateSedeFeriadosAdapter = async (
  id: string,
  fechas_feriado: string[]
) => {
  if (!id) {
    throw new Error("No se encontró el ID de la sede.");
  } // cierra if (!id)

  // Normalizamos: sin vacíos, sin duplicados y ordenadas
  const clean = Array.from(new Set(fechas_feriado.filter(Boolean))).sort();

  const sedeRef = doc(db, FIRESTORE_COLLECTIONS.CORE_SEDES, id);
  await setDoc(
    sedeRef,
    { fechas_feriado: clean, updatedAt: Timestamp.now() },
    { merge: true }
  );

  return { id, fechas_feriado: clean };
}; // cierra export const updateSedeFeriadosAdapter