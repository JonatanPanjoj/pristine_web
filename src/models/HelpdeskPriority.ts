export interface HelpdeskPriority {
  /** ID del documento en Firestore */
  id: string;

  /** Antiguo ID de prioridad */
  id_prioridad?: number;

  /** Nombre de la prioridad */
  name: string;

  /** Tiempo de respuesta */
  responseTime: string; // formato 'HH:MM:SS'

  /** Tiempo de solución */
  solutionTime: string; // formato 'HH:MM:SS'

  /** Tiempo de recordatorio */
  reminderTime: string; // formato 'HH:MM:SS'

  /** Color asociado a la prioridad */
  color: string; // formato '#FFFFFF'

  /** SMS asociado a la prioridad */
  sms: boolean;

  /** Situación de la prioridad */
  is_enabled: boolean;
}
