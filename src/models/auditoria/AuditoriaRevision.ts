import { AuditoriaFindingFlag, AuditoriaResponsibleType } from './AuditoriaCatalogs';
import { AuditoriaWeightingType } from './AuditoriaQuestionnaire';

export type AuditoriaRevisionStatus = 'programada' | 'en_ejecucion' | 'finalizada' | 'vencida';

/**
 * Id de un estado del catálogo `auditoria_finding_statuses`.
 *
 * Es un alias de `string` y no una unión fija porque los estados los configura
 * el usuario. Los tres de fábrica conservan sus ids antiguos —`pendiente`,
 * `en_proceso`, `solucionado`— para que los hallazgos ya guardados sigan
 * resolviendo sin migración.
 */
export type AuditoriaFindingStatus = string;

export interface AuditoriaQuestionImage {
  image_id: string;
  url: string;
  caption?: string;
  uploaded_at: string;
}

export interface AuditoriaQuestionResponse {
  question_id: string;
  question_text: string;
  weighting_type: AuditoriaWeightingType;
  value_selected?: string | number;
  points_earned: number;
  points_max: number;
  is_na: boolean;
  nota_pregunta?: string;
  images?: AuditoriaQuestionImage[];
  /** Decisión manual sobre si esta respuesta es hallazgo. Por omisión, `auto`. */
  finding_flag?: AuditoriaFindingFlag;
}

export interface AuditoriaSectionResult {
  section_id: string;
  friendly_id: string;
  section_number: number;
  name: string;
  purpose: string;
  total_preguntas_seccion: number;
  preguntas_respondidas_cant: number;
  preguntas_no_respondidas_cant: number;
  preguntas_respondidas_porcentaje: number;
  preguntas_no_respondidas_porcentaje: number;
  puntos_obtenidos_seccion: number;
  puntos_maximos_seccion: number;
  porcentaje_nota_seccion: number;
  respuestas_preguntas: AuditoriaQuestionResponse[];
}

export interface AuditoriaGlobalMetrics {
  nota_final_puntos: number;
  nota_maxima_posible_puntos: number;
  nota_final_porcentaje: number;
  total_preguntas: number;
  preguntas_respondidas_cant: number;
  preguntas_no_respondidas_cant: number;
  preguntas_respondidas_porcentaje: number;
  preguntas_no_respondidas_porcentaje: number;
}

/**
 * Quién debe resolver un hallazgo.
 *
 * Se guarda el nombre junto al id a propósito: el hallazgo se lee meses después
 * y no puede quedar en blanco porque el usuario se dio de baja o el proveedor
 * salió del catálogo.
 */
export interface AuditoriaResponsible {
  id: string;
  name: string;
  type: AuditoriaResponsibleType;
}

/** Cada movimiento registrado sobre un hallazgo, para poder leer su evolución. */
export interface AuditoriaFindingHistoryEntry {
  entry_id: string;
  status: AuditoriaFindingStatus;
  comentario: string;
  registered_at: string;
  registered_by?: string;
  /** Evidencia de ese momento concreto, no del hallazgo entero. */
  images?: AuditoriaQuestionImage[];
}

/**
 * Un hallazgo es un compromiso de mejora que nace del plan de auditoría, ya con
 * la auditoría cerrada. Apunta a la pregunta que lo originó, pero no es su
 * respuesta: la respuesta describe qué se encontró, el hallazgo qué se hará.
 *
 * Vive en su propia colección (`auditoria_findings`) porque su ciclo de vida es
 * independiente del de la auditoría: se sigue, se reasigna y se cierra después.
 */
export interface AuditoriaFinding {
  /** Id del documento: determinista a partir de la revisión y la pregunta. */
  finding_id: string;
  /** Código legible del ticket, único en todo el módulo. */
  ticket_id: string;
  revision_id: string;
  revision_friendly_id: string;
  sede_id: string;
  department_id: string;
  category_id: string;
  questionnaire_name: string;
  question_id: string;
  question_text: string;
  section_id: string;
  section_name: string;
  descripcion: string;
  /** Uno o varios: un hallazgo puede requerir a más de una persona o área. */
  responsables: AuditoriaResponsible[];
  fecha_limite: string;
  status: AuditoriaFindingStatus;
  /** Id de una prioridad del catálogo; vacío mientras no se le asigne una. */
  priority_id?: string;
  images: AuditoriaQuestionImage[];
  created_at: string;
  updated_at: string;
  historial: AuditoriaFindingHistoryEntry[];
}

/** Observación crítica levantada contra un departamento durante el cierre. */
export interface AuditoriaCriticalObservation {
  department_id: string;
  department_name: string;
  observacion: string;
}

/**
 * Una reprogramación o una reasignación de la auditoría.
 *
 * Se guardan en la propia revisión y no en la programación: mover una jornada
 * concreta no cambia el calendario del que nació, y quien lea la ficha meses
 * después necesita ver ahí por qué se movió.
 */
export interface AuditoriaRevisionChange {
  changeId: string;
  type: 'reschedule' | 'reassign';
  changedAt: string;
  changedByUserId: string;
  changedByUserName: string;
  justification: string;
  previousDate?: string;
  newDate?: string;
  previousUserId?: string;
  previousUserName?: string;
  newUserId?: string;
  newUserName?: string;
}

export interface AuditoriaLocation {
  latitude: number;
  longitude: number;
  altitude: number;
  timestamp: string;
}

export interface AuditoriaRevision {
  id: string;
  friendly_id: string;
  schedule_id?: string | null;
  sede_id: string;
  department_id: string;
  category_id: string;
  questionnaire_id: string;
  questionnaire_name?: string;
  status: AuditoriaRevisionStatus;
  usuario_programo_id?: string;
  usuario_programo_nombre?: string;
  usuario_ejecuto_id?: string;
  usuario_ejecuto_nombre?: string;
  responsable_evaluado?: string;
  scheduled_datetime?: string;
  start_datetime?: string;
  end_datetime?: string;
  created_at?: string;
  updated_at?: string;
  observaciones_creacion?: string;
  observaciones_ejecucion?: string;
  firma_auditor?: string;
  firma_evaluado?: string;
  correos_notificacion?: string;
  start_location?: AuditoriaLocation;
  end_location?: AuditoriaLocation;
  observaciones_criticas?: AuditoriaCriticalObservation[];
  plan_generado_at?: string;
  plan_observaciones?: string;
  /** Para cuándo se compromete el área a tener resuelto todo el plan. */
  plan_fecha_compromiso?: string;
  change_log?: AuditoriaRevisionChange[];
  métricas_globales: AuditoriaGlobalMetrics;
  secciones_resultado: AuditoriaSectionResult[];
}
