// getSectorsBySedeId.ts
import { db } from "../../../services/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Sector } from "../../../models/Sector"; // Asegúrate de que el modelo Sector esté correctamente importado

import { FIRESTORE_COLLECTIONS } from "../../../constants/firestoreCollections";

// Función para obtener todos los sectores con el SedeId especificado
export const getSectorsBySedeId = async (sedeId: string): Promise<Sector[]> => {
  const sectorsCollection = collection(db, FIRESTORE_COLLECTIONS.CORE_SECTORS); // Colección de sectores

  // Crear una consulta para filtrar por SedeId
  const sectorsQuery = query(sectorsCollection, where("SedeId", "==", sedeId));

  // Ejecutar la consulta y obtener los documentos
  const querySnapshot = await getDocs(sectorsQuery);

  // Mapear los documentos obtenidos a una lista de objetos Sector
  const sectors = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Sector[];

  return sectors;
};
