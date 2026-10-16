// getSectorsBySedeId.ts
import { db } from "../../../services/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Area } from "../../../models/Area"; // Asegúrate de que el modelo Sector esté correctamente importado

import { FIRESTORE_COLLECTIONS } from "../../../constants/firestoreCollections";

// Función para obtener todos los sectores con el SedeId especificado
export const getAreasBySectorId = async (sectorId: string): Promise<Area[]> => {
  const AreasCollection = collection(db, FIRESTORE_COLLECTIONS.CORE_AREAS); // Colección de sectores

  // Crear una consulta para filtrar por SedeId
  const sectorsQuery = query(AreasCollection, where("SectorId", "==", sectorId));

  // Ejecutar la consulta y obtener los documentos
  const querySnapshot = await getDocs(sectorsQuery);

  // Mapear los documentos obtenidos a una lista de objetos Sector
  const Areas = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Area[];

  return Areas;
};
