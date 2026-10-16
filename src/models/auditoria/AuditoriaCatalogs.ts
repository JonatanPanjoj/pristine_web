/** Base común de los catálogos configurables del módulo. */
export interface AuditoriaCatalogItem {
  id: string;
  name: string;
  /** Hex, para el distintivo en tablas y tarjetas. */
  color: string;
  position: number;
  is_enabled: boolean;
  updated_at?: string;
}

export interface AuditoriaFindingStatusItem extends AuditoriaCatalogItem {
  /**
   * Da el hallazgo por resuelto.
   *
   * Sin esta marca, agregar un estado nuevo dejaría los contadores y las
   * alertas de vencimiento equivocados en silencio: no sabrían si "Verificado"
   * cierra el hallazgo o lo deja abierto.
   */
  is_closed: boolean;
}

/**
 * Qué respuesta cuenta como hallazgo en cada tipo de ponderación.
 *
 * Antes estaba escrito en el código —cinco o menos, un «no»—, y eso obligaba a
 * tocar el programa cada vez que una empresa entendía el hallazgo de otra
 * manera. Es una tabla porque es una decisión del negocio, no del sistema.
 */
export interface AuditoriaFindingRule {
  /** El id es el propio tipo de ponderación: hay una regla por tipo. */
  id: string;
  name: string;
  /** Con esto apagado, ese tipo de pregunta nunca levanta hallazgo. */
  is_enabled: boolean;
  /** Escala numérica: una calificación igual o menor a esto es hallazgo. */
  threshold: number;
  /** Respuestas concretas que son hallazgo, para los tipos de opciones. */
  finding_values: string[];
  position: number;
  updated_at?: string;
}

/**
 * Lo que decide una persona sobre una pregunta concreta, por encima de la regla.
 *
 * `auto` deja mandar al catálogo. Las otras dos existen porque ninguna regla
 * general acierta siempre: a veces un 8 esconde algo grave y a veces un 3 ya
 * estaba justificado, y quien audita tiene que poder decirlo sin falsear la
 * calificación.
 */
export type AuditoriaFindingFlag = 'auto' | 'forzar' | 'excluir';

/**
 * De dónde salió el responsable. Se guarda para no volver a importar dos veces
 * a la misma persona y para saber a quién seguirle la pista en su origen.
 */
export type AuditoriaResponsibleOrigin = 'usuario' | 'proveedor' | 'manual';

/** Interno es de la casa; externo es quien viene de fuera, proveedores incluidos. */
export type AuditoriaResponsibleType = 'interno' | 'externo';

/**
 * Quién puede quedar a cargo de un hallazgo.
 *
 * Es catálogo propio y no la lista viva de usuarios porque no todo el que entra
 * a la aplicación responde por una auditoría, y porque un proveedor externo
 * nunca aparecería en esa lista.
 */
export interface AuditoriaResponsibleItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: AuditoriaResponsibleType;
  origin: AuditoriaResponsibleOrigin;
  /** Id en su origen: evita importar dos veces al mismo usuario o proveedor. */
  source_id: string;
  is_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Lo que la prioridad compromete, en `HH:MM:SS` como las prioridades de mesa de
 * ayuda: el mismo formato para no tener dos maneras de decir "tres horas".
 */
export interface AuditoriaFindingPriority extends AuditoriaCatalogItem {
  /** Cuánto se tiene para dar la primera respuesta al hallazgo. */
  response_time: string;
  /** Cuánto se tiene para resolverlo. */
  solution_time: string;
  /** Cuánto antes del vencimiento se recuerda. */
  reminder_time: string;
  /**
   * El aviso además llega al teléfono como notificación push, no solo al
   * correo. Es el mismo canal que usa mesa de ayuda: un documento en
   * `system_notifications` que el trigger reparte por FCM.
   */
  push: boolean;
}
