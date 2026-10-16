// getSectorNameById.ts
import { db } from "../../../services/firebase";
import { doc, getDoc } from "firebase/firestore";

import { FIRESTORE_COLLECTIONS } from "../../../constants/firestoreCollections";

// Función para obtener el nombre de un sector por su ID
export const getSectorNameById = async (sectorId: string): Promise<string | null> => {
  const sectorRef = doc(db, FIRESTORE_COLLECTIONS.CORE_SECTORS, sectorId); // Referencia al documento del sector

  // Obtener el documento del sector
  const sectorSnapshot = await getDoc(sectorRef);

  // Verificar si el documento existe y devolver el nombre del sector
  if (sectorSnapshot.exists()) {
    const sectorData = sectorSnapshot.data();
    return sectorData?.name || null; // Devuelve el nombre o null si no existe
  }

  // Si no se encuentra el sector, devuelve null
  return null;
};
