import { db } from "../../../services/firebase";
import { User } from "../../../models/User";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  startAfter,
  limit,
  QueryDocumentSnapshot
} from "firebase/firestore";

import { FIRESTORE_COLLECTIONS } from "../../../constants/firestoreCollections";

// Referencia a la colección de usuarios
const usersCollection = collection(db, FIRESTORE_COLLECTIONS.AUTH_USERS);

interface GetUsersOptions {
  pageSize: number;
  lastDoc?: QueryDocumentSnapshot<User>;
}

// Adapter para obtener usuarios habilitados con paginación
export async function getEnabledUsersAdapter({ pageSize, lastDoc }: GetUsersOptions) {
  try {
    let snapshot;
    try {
      // Intentar consulta ordenada (requiere índice compuesto en Firestore)
      const userQuery = lastDoc
        ? query(
            usersCollection,
            where("is_enabled", "==", true),
            orderBy("name"),
            startAfter(lastDoc),
            limit(pageSize)
          )
        : query(usersCollection, where("is_enabled", "==", true), orderBy("name"), limit(pageSize));
      snapshot = await getDocs(userQuery);
    } catch (indexError) {
      console.warn("Falta el índice compuesto en Firestore; ejecutando consulta de respaldo:", indexError);
      const fallbackQuery = lastDoc
        ? query(usersCollection, where("is_enabled", "==", true), startAfter(lastDoc), limit(pageSize))
        : query(usersCollection, where("is_enabled", "==", true), limit(pageSize));
      snapshot = await getDocs(fallbackQuery);
    }

    // Obtener usuarios y ordenar localmente por nombre
    const users = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }) as User)
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    // Retornar los usuarios y el último documento para la siguiente página
    return { users, lastDoc: snapshot.docs[snapshot.docs.length - 1] };
  } catch (error) {
    console.error("Error al obtener usuarios habilitados:", error);
    throw error;
  }
}
