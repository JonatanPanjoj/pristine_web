import { PPMRecurrence, PPMScheduleChange } from '../PPM';

/**
 * La recurrencia de una auditoría usa el mismo motor que PPM
 * (`services/ppmRecurrence.ts`): días del mes, días de semana con su posición,
 * meses activos, feriados y excepciones. Duplicarlo solo traería dos calendarios
 * que se comportan distinto ante el mismo caso.
 */
export type AuditoriaRecurrence = PPMRecurrence;

/** Una modificación del calendario de la programación, con su autor y origen. */
export type AuditoriaScheduleChange = PPMScheduleChange;

/** Frecuencia simple de las programaciones creadas antes del motor completo. */
export type AuditoriaScheduleRecurrence = 'unica' | 'semanal' | 'quincenal' | 'mensual';

export type AuditoriaScheduleStatus = 'activa' | 'pausada' | 'cancelada';

export interface AuditoriaSchedule {
  id: string;
  friendly_id: string;
  titulo: string;
  descripcion?: string;
  sede_id: string;
  department_id: string;
  category_id: string;
  questionnaire_id: string;
  usuario_programo_id: string;
  usuario_programo_nombre?: string;
  usuario_asignado_id: string;
  usuario_asignado_nombre?: string;
  /** A quién se evalúa en la sede: se hereda a cada auditoría que nazca. */
  responsable_evaluado?: string;
  scheduled_date: string;
  expiration_date: string;
  /** Regla completa del calendario. Las programaciones viejas no la tienen. */
  recurrence_rule?: AuditoriaRecurrence | null;
  /**
   * Regla con la que se numeran las auditorías, congelada la primera vez que se
   * edita la recurrencia. El código sale de la posición en la serie, así que
   * numerar con la regla vigente renumeraría auditorías ya emitidas.
   */
  numbering_rule?: AuditoriaRecurrence | null;
  /** Frecuencia simple heredada; solo se usa si no hay `recurrence_rule`. */
  recurrence?: AuditoriaScheduleRecurrence;
  status: AuditoriaScheduleStatus;
  observaciones_programacion?: string;
  change_log?: AuditoriaScheduleChange[];
  created_at?: string;
  updated_at?: string;
}
