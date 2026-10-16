import { Timestamp } from "firebase/firestore";

export interface List {
    id: string; // Firestore document ID
    id_category: string; // ID de la categoría asociada
    is_enabled: boolean; // Estado habilitado o no
    list_id: string; // ID original (cadena de caracteres)
    name: string; // Nombre de la lista
    need_firm: boolean; // Indica si necesita firma
    need_photo: boolean; // Indica si necesita foto
    updatedAt: Timestamp| { seconds: number; nanoseconds: number } ;
  }
  