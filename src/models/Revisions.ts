import { Timestamp } from "firebase/firestore";

// Interfaz para Responses (Subdocumento)
export interface RevisionResponse {
  answer: number; // Respuesta, representada como un número
  list_id: string; // ID de la lista asociada
  question_id: string; // ID de la pregunta asociada
  registration_date: Date; // Fecha de registro
}
// Interfaz para Revisions
export interface Revisions {
  id: string; // ID único de la revisión
  list_id: string; // ID de la lista asociada
  observations: string; // Observaciones
  old_id: number; // ID antiguo (puede estar relacionado con una migración)
  programming_id: string; // ID de la programación asociada
  signature: string; // Firma (puede ser un URL o un valor encriptado)
  start_date: Timestamp; // Fecha de inicio de la revisión
  end_date: Timestamp; // Fecha de finalización de la revisión
  status: number; // Estado de la revisión (ejemplo: 0 = pendiente, 1 = completado)
  supervisor: string | null; // Supervisor asignado (puede ser nulo si no hay supervisor)
  user_id: string; // ID del usuario asociado
  responsesFosQuest?: RevisionResponse[]; // Subdocumento de respuestas asociadas
  PhotoData?:PhotoData[]
}

export interface PhotoData {
  old_id: string; // Código antiguo de la foto
  photo_url: string; // URL de la foto
  name?: string; 
  registration_date: string; // Fecha de registro
}
