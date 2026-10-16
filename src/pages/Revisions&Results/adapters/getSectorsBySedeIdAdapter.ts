import { db } from "../../../services/firebase";
import { Sector } from "../../../models/Sector";
import { collection, query, where, getDocs } from "firebase/firestore";

import { FIRESTORE_COLLECTIONS } from "../../../constants/firestoreCollections";

/**
 * Obtiene todos los sectores pertenecientes a una sede.
 *
 * @param sedeId - ID de la sede.
 * @returns Promise<Sector[]>
 */
export const getSectorsBySedeIdAdapter = async (sedeId: string): Promise<Sector[]> => {
  const sectorsCollection = collection(db, FIRESTORE_COLLECTIONS.CORE_SECTORS);
  const sectorsQuery = query(sectorsCollection, where("SedeId", "==", sedeId));
  const snapshot = await getDocs(sectorsQuery);

  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Sector));
};
