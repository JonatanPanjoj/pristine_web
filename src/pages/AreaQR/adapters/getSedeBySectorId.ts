import { db } from "../../../services/firebase";
import { collection, doc, getDoc } from "firebase/firestore";

import { FIRESTORE_COLLECTIONS } from "../../../constants/firestoreCollections";

// Función para buscar la sede por su ID y devolver el nombre
export const getSedeById = async (sedeId: string): Promise<string | null> => {
  const sedeRef = doc(db, FIRESTORE_COLLECTIONS.CORE_SEDES, sedeId); // Referencia al documento de la sede usando su ID

  // Obtener el documento de la sede
  const sedeSnapshot = await getDoc(sedeRef);

  // Verificar si existe el documento
  if (sedeSnapshot.exists()) {
    const sedeData = sedeSnapshot.data(); // Obtener los datos de la sede
    return sedeData?.name || null; // Devolver el nombre de la sede o null si no existe
  }

  // Si no se encontró ninguna sede con ese ID, devolver null
  return null;
};