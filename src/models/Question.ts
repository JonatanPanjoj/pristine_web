import { Timestamp } from "firebase/firestore";

export interface Question {
    id: string; // Firestore document ID
    id_List: string; // ID de la lista a la que pertenece la pregunta
    is_enabled: boolean; // Estado habilitado o no
    question: string; // Texto de la pregunta
    question_id?: string; // ID original de la pregunta// dato de migracion no tomar en cuenta
    updatedAt: Timestamp| { seconds: number; nanoseconds: number } ;
  }
  