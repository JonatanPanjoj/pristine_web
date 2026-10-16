import { db } from "../../../services/firebase";
import { Area } from "../../../models/Area"; // Importa el modelo de Area
import { collection, doc, setDoc, getDocs, query, orderBy, limit } from "firebase/firestore";

import { FIRESTORE_COLLECTIONS } from "../../../constants/firestoreCollections";

// Colección de Firestore para Area
const areasCollection = collection(db, FIRESTORE_COLLECTIONS.CORE_AREAS);

/**
 * Función para obtener el área_id más alto en la colección y devolver el siguiente valor.
 * @returns Promise<number> - Promesa que resuelve con el nuevo área_id.
 */
const getNextAreaId = async (): Promise<number> => {
  try {
    // Consultar el área con el area_id más alto
    const q = query(areasCollection, orderBy('area_id', 'desc'), limit(1));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const highestArea = querySnapshot.docs[0].data() as Area;
      return (typeof highestArea.area_id === 'number' ? highestArea.area_id : parseInt(highestArea.area_id)) + 1;
    } else {
      return 1; // Si no hay áreas, comenzar con 1
    }
  } catch (error) {
    console.error("Error al obtener el área_id más alto:", error);
    throw new Error("No se pudo obtener el siguiente área_id.");
  }
};

/**
 * Función para crear un nuevo área en la base de datos Firestore.
 * Firestore genera automáticamente un nuevo ID para el documento.
 *
 * @param area - Objeto de tipo Area que contiene los datos del nuevo área, excepto el id y area_id.
 * @returns Promise<string> - Promesa que resuelve con el ID del nuevo documento creado.
 * @throws Error - Lanza un error si no se puede crear el área.
 */
export const createNewAreaAdapter = async (area: Omit<Area, 'id' | 'area_id'>): Promise<string> => {
  try {
    // Obtener el siguiente area_id disponible
    const nextAreaId = await getNextAreaId();

    // Generar una nueva referencia de documento con un ID automático
    const newAreaRef = doc(areasCollection);

    // Crear el documento con los datos del nuevo área
    await setDoc(newAreaRef, {
      ...area,
      id: newAreaRef.id, // Agregar el nuevo ID generado al documento
      area_id: nextAreaId, // Agregar el nuevo area_id calculado
    });

    console.log("Área creada exitosamente con ID:", newAreaRef.id);
    return newAreaRef.id;
  } catch (error) {
    console.error("Error al crear el área:", error);
    throw new Error("No se pudo crear el área.");
  }
};
