import { db } from "../../../services/firebase";
import { collection, query, where, orderBy, limit, startAfter, getDocs, DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

import { FIRESTORE_COLLECTIONS } from "../../../constants/firestoreCollections";

const sedesCollection = collection(db, FIRESTORE_COLLECTIONS.CORE_SEDES);

/**
 * Adaptador para obtener sedes habilitadas en lotes de 10.
 * @param lastDoc - Documento de referencia para paginación (opcional).
 * @returns Promise<{ sedes: DocumentData[], lastDoc: QueryDocumentSnapshot<DocumentData> | undefined }>
 */
export const fetchEnabledSedesInBatchesAdapter = async (lastDoc?: QueryDocumentSnapshot<DocumentData>) => {
  try {
    let sedeQuery = query(
      sedesCollection,
      where("is_enabled", "==", true),
      orderBy("name"),
      limit(10)
    );

    if (lastDoc) {
      sedeQuery = query(sedeQuery, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(sedeQuery);
    const sedes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const newLastDoc = querySnapshot.docs[querySnapshot.docs.length - 1] || undefined;

    return { sedes, lastDoc: newLastDoc };
  } catch (error) {
    console.error("Error al obtener sedes habilitadas en lotes:", error);
    throw new Error("No se pudo obtener la lista de sedes habilitadas.");
  }
};
