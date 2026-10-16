import { collection, query, where, getCountFromServer } from "firebase/firestore";
import { db } from "../../../services/firebase"; // Ajusta esta ruta según tu proyecto
import { FIRESTORE_COLLECTIONS } from "../../../constants/firestoreCollections";

export const countSectorsBySedeId = async (sedeId: string): Promise<number> => {
  try {
    // Referencia a la colección de sectores filtrada por sedeId
    const sectorsCollection = collection(db, FIRESTORE_COLLECTIONS.CORE_SECTORS);
    const totalDocsSnapshot = await getCountFromServer(
        query(sectorsCollection, where("SedeId", "==", sedeId)) // Filtrar por SedeId
      );
      const totalDocs = totalDocsSnapshot.data().count;
      console.log(sedeId)
      console.log(totalDocs)

    return totalDocs
  } catch (error) {
    console.error("Error al contar los sectores:", error);
    throw error;
  }
};
