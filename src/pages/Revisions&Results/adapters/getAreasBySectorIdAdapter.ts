import { db } from "../../../services/firebase";
import { Area } from "../../../models/Area";
import { collection, query, where, getDocs } from "firebase/firestore";

import { FIRESTORE_COLLECTIONS } from "../../../constants/firestoreCollections";

/**
 * Obtiene todas las áreas pertenecientes a un sector.
 *
 * @param sectorId - ID del sector.
 * @returns Promise<Area[]>
 */
export const getAreasBySectorIdAdapter = async (sectorId: string): Promise<Area[]> => {
  const areasCollection = collection(db, FIRESTORE_COLLECTIONS.CORE_AREAS);
  const areasQuery = query(areasCollection, where("SectorId", "==", sectorId));
  const snapshot = await getDocs(areasQuery);

  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Area));
};
