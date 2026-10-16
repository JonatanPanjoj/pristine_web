/**
 * Colecciones Firebase NoSQL del Módulo PPM:
 * - ppm_schedules
 * - ppm_failure_reports
 * - ppm_warehouse_inventory
 * - ppm_material_usages
 */

export type PPMOriginType = 'activity' | 'asset';
export type PPMExecutionType = 'internal' | 'external';
export type PPMScheduleStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled';
export type PPMScheduleType = 'preventive' | 'corrective' | 'inspection';
export type PPMFailureSeverity = 'critical' | 'high' | 'medium' | 'low';
export type PPMFailureStatus = 'reported' | 'in_repair' | 'resolved';

export interface PPMLocation {
  sedeId: number | string;
  sedeName: string;
  sectorId: number | string;
  sectorName: string;
  areaId: number | string;
  areaName: string;
}

export interface PPMAssignable {
  type: PPMOriginType;
  assetId?: string | null;
  assetName?: string | null;
  activityId?: string | null;
  activityName?: string | null;
}

export interface PPMProvider {
  providerId: string;
  providerName: string;
  contactName?: string | null;
  phone?: string | null;
}

/**
 * Proveedor / contratista del catálogo (`ppm_providers`). Centralizar los
 * nombres aquí evita duplicados al asignarlos a una programación.
 */
export interface PPMProviderItem {
  providerId: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  specialty: string;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Actividad de mantenimiento del catálogo (`ppm_activities`). Es el origen de
 * las OT que no van contra un activo concreto.
 */
export interface PPMActivityItem {
  activityId: string;
  name: string;
  description: string;
  location: PPMLocation;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PPMAssignedUser {
  id: string;
  name: string;
  role?: string;
  email?: string;
  url_photo?: string | null;
  phone?: string;
}

/**
 * Evidencias de cierre. Las fotos son listas (`photosBeforeUrls` /
 * `photosAfterUrls`); `photoBeforeUrl` y `photoAfterUrl` sobreviven como portada
 * y como respaldo de los registros anteriores a la migración.
 */
export interface PPMEvidences {
  photoBeforeUrl?: string | null;
  photoAfterUrl?: string | null;
  photosBeforeUrls?: string[];
  photosAfterUrls?: string[];
  signatureUrl?: string | null;
  signedBy?: string | null;
  signedAt?: string | null;
}

export interface PPMBudget {
  currency: string;
  scheduledAmount: number;
  executedAmount?: number | null;
  variance?: number | null;
}

/** Desde dónde se tocó la programación. */
export type PPMScheduleChangeSource = 'calendar' | 'recurrence';

/**
 * Una modificación del calendario de la programación.
 *
 * Se guarda el resultado —qué días entraron y cuáles salieron— y no el gesto,
 * porque mover una jornada de un día a otro es lo mismo que quitarla de uno y
 * agregarla al otro, y así la bitácora se lee igual venga de donde venga.
 */
export interface PPMScheduleChange {
  changeId: string;
  changedAt: string;
  changedByUserId?: string;
  changedByUserName?: string;
  source: PPMScheduleChangeSource;
  addedDates: string[];
  removedDates: string[];
}

export interface PPMRescheduleHistory {
  previousStartDate: string;
  newStartDate: string;
  previousEndDate: string;
  newEndDate: string;
  justification: string;
  modifiedByUserId: string;
  modifiedByUserName?: string;
  modifiedAt: string;
}

/**
 * Representa una Programación / Programación en Firebase (`ppm_schedules`)
 */
export interface PPMSchedule {
  scheduleId: string;
  title: string;
  description?: string;
  originType: PPMOriginType;
  executionType: PPMExecutionType;
  scheduledStartDate: string;
  scheduledEndDate: string;
  actualStartDate?: string | null;
  actualEndDate?: string | null;
  totalManHours?: number | null; // (actualEndDate - actualStartDate) * assignedUsers.length
  allDay: boolean;
  color: string;
  status: PPMScheduleStatus;
  type: PPMScheduleType;
  assignable: PPMAssignable;
  provider?: PPMProvider | null;
  category: {
    id: number;
    name: string;
    color: string;
  };
  questionnaire?: {
    id: string;
    title: string;
  } | null;
  location: PPMLocation;
  assignedUserIds: string[];
  assignedUsers: PPMAssignedUser[];
  evidences?: PPMEvidences | null;
  budget: PPMBudget;
  rescheduleHistory?: PPMRescheduleHistory[];
  /**
   * Presente solo en OT recurrentes: convierte la orden en un marco de horarios
   * del que la Cloud Function materializa una orden de trabajo por cada día válido.
   */
  recurrence?: PPMRecurrence | null;
  /**
   * Regla con la que se numeran las órdenes, congelada la primera vez que se
   * edita la recurrencia de una programación que ya generó trabajo.
   *
   * Existe porque el código de la orden sale de su posición en la serie: si se
   * numerara con la regla vigente, cambiar la frecuencia renumeraría órdenes ya
   * emitidas. La generación usa `recurrence`; la numeración, esta.
   */
  numberingRecurrence?: PPMRecurrence | null;
  /** Quién tocó el calendario, cuándo y desde dónde. */
  changeLog?: PPMScheduleChange[];
  generation?: PPMGeneration | null;
  /** Espejo booleano de `recurrence`: es sobre lo que consulta la Cloud Function. */
  isRecurring?: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Representa un Reporte de Falla en Activos de PPM (`ppm_failure_reports`)
 */
export interface PPMFailureReport {
  failureId: string;
  asset: {
    assetId: string;
    assetName: string;
    serialNumber: string;
  };
  previousScheduleId?: string | null; // OT previa asociada
  generatedScheduleId: string; // OT correctiva/urgente generada automáticamente
  description: string;
  severity: PPMFailureSeverity;
  failureDate: string;
  reportedByUser: {
    id: string;
    name: string;
  };
  solution?: {
    solutionDescription: string;
    solvedAt: string;
    solvedByUser: {
      id: string;
      name: string;
    };
  } | null;
  status: PPMFailureStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Representa el inventario de la Bodega Principal de PPM (`ppm_warehouse_inventory`)
 */
export interface PPMWarehouseInventory {
  itemId: string;
  skuCode: string;
  qrCode: string;
  name: string;
  description?: string;
  category: string;
  currentStock: number;
  minimumStock: number;
  unitOfMeasure: string;
  unitCost: number;
  locationInWarehouse?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Representa el desglose de salida, reintegro y consumo de materiales por OT (`ppm_material_usages`)
 */
export interface PPMMaterialUsage {
  usageId: string;
  scheduleId: string;
  inventoryItemId: string;
  inventoryItemName: string;
  skuCode: string;
  qrCode?: string;
  quantityRequested: number;
  quantityReturned: number;
  quantityConsumed: number; // quantityRequested - quantityReturned
  unitOfMeasure: string;
  unitCost: number;
  totalCost: number; // quantityConsumed * unitCost
  dispatchedByUserId: string;
  dispatchedAt: string;
  returnedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Representa un Activo Físico o Equipo de Mantenimiento (`ppm_assets`)
 */
export interface PPMAsset {
  assetId: string;
  name: string;
  brand: string;
  model: string;
  serialNumber: string;
  partNumber?: string | null;
  imageUrl?: string | null;
  /** Precio de adquisición, para el registro financiero del inventario. */
  acquisitionPrice?: number | null;
  /** Precio del equipo nuevo, de referencia para valorar su reposición. */
  originalPrice?: number | null;
  /** Valor actual tras depreciación. */
  currentPrice?: number | null;
  acquisitionCurrency?: string;
  /** Capacidad nominal del equipo (BTU, litros, toneladas…). */
  capacity?: string;
  /** Periodicidad del mantenimiento preventivo (mensual, anual…). */
  maintenancePeriodicity?: string;
  /** Unidades que agrupa este registro. */
  quantity?: number;
  observations?: string;
  /** Proveedor del catálogo que lo suministra. */
  provider?: {
    providerId: string;
    providerName: string;
  } | null;
  category: {
    id: number;
    name: string;
  };
  location: PPMLocation;
  photos?: Array<{
    photoId: string;
    url: string;
    position: number;
    createdAt: string;
  }>;
  usageHours: {
    currentHours: number;
    maintenanceThresholdHours: number;
    lastMaintenanceEntryDate?: string | null;
    lastMaintenanceExitDate?: string | null;
    condition: 'optimal' | 'warning' | 'critical';
  };
  status: 'active' | 'in_maintenance' | 'out_of_service' | 'decommissioned';
  createdAt: string;
  updatedAt: string;
}

/**
 * Representa una Categoría o Especialidad Técnica (`ppm_categories`)
 */
export interface PPMCategoryItem {
  categoryId: number;
  name: string;
  color: string;
  isEnabled: boolean;
  allowedUserIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PPMQuestion {
  id: string;
  questionText: string;
  order: number;
  isEnabled: boolean;
  type: 'binary' | 'text' | 'numeric';
  requiresPhoto: boolean;
}

/**
 * Representa un Cuestionario / Checklist de Procedimiento Técnico (`ppm_questionnaires`)
 */
export interface PPMQuestionnaireItem {
  id: string;
  categoryId: number;
  categoryName: string;
  title: string;
  isEnabled: boolean;
  questions: PPMQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface PPMWorkOrderAnswer {
  questionId: string;
  questionText: string;
  value: 'yes' | 'no' | 'na';
  numericValue?: number | null;
  photoUrl?: string | null;
  observations?: string;
}

export interface PPMWorkOrderPhoto {
  photoId: string;
  url: string;
  createdAt: string;
}

export type PPMWorkOrderStatus = 'pending' | 'in_progress' | 'completed' | 'requires_action';

/**
 * Representa una Ejecución / Orden de Trabajo Técnica de Mantenimiento (`ppm_workOrders`)
 *
 * Nace en dos escenarios:
 * - `pending`, creada por la Cloud Function a partir de una OT recurrente. En ese
 *   caso `scheduledDate` la fija la programación y `startDate` sigue vacío.
 * - Al ejecutar una OT puntual, ya en `in_progress`.
 */
export interface PPMWorkOrderUser {
  id: string;
  name: string;
}

interface PPMWorkOrderChangeBase {
  justification: string;
  changedByUserId: string;
  changedByUserName?: string;
  changedAt: string;
}

/** Cambio de día: guarda de dónde venía para poder leer el movimiento. */
export interface PPMWorkOrderReschedule extends PPMWorkOrderChangeBase {
  type: 'reschedule';
  previousDate: string;
  newDate: string;
}

/** Cambio de técnicos, con el reparto anterior y el nuevo. */
export interface PPMWorkOrderReassign extends PPMWorkOrderChangeBase {
  type: 'reassign';
  previousUsers: PPMWorkOrderUser[];
  newUsers: PPMWorkOrderUser[];
}

/** Una entrada de la bitácora de la orden. Reprogramar y reasignar son distintos. */
export type PPMWorkOrderChange = PPMWorkOrderReschedule | PPMWorkOrderReassign;

export interface PPMWorkOrder {
  workOrderId: string;
  scheduleId: string; // OT a la que pertenece
  scheduledDate: string; // "YYYY-MM-DD": el día en que toca hoy por hoy; se puede reprogramar
  /**
   * Día de la ocurrencia de la que nació, del que sale su código. No cambia
   * nunca: el código identifica la ocurrencia, no la fecha en que se acabe
   * ejecutando. La proyección se apoya en esto para no volver a proyectar un día
   * cuya orden ya existe pero se movió a otro. Ausente en las órdenes anteriores
   * a la reprogramación; se lee `originDate ?? scheduledDate`.
   */
  originDate?: string;
  /** Bitácora: reprogramaciones y reasignaciones, en orden cronológico. */
  changeLog?: PPMWorkOrderChange[];
  assignable: PPMAssignable;
  location: PPMLocation;
  executedByUsers: Array<{ id: string; name: string }>;
  supervisor?: { id: string; name: string } | null;
  status: PPMWorkOrderStatus;
  startDate?: string | null; // cuándo se empezó de verdad, lo fija el técnico
  endDate?: string | null;
  durationMinutes?: number | null;
  observations: string;
  signatureUrl?: string | null;
  photos: PPMWorkOrderPhoto[];
  /**
   * Evidencias de cierre (antes/después/firma). Vive en la orden de trabajo, no en la
   * OT: cada día ejecutado tiene las suyas.
   */
  evidences?: PPMEvidences | null;
  answers: PPMWorkOrderAnswer[];
  actualCost: number;
  createdAt: string;
}

export type PPMWeekday = 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU';
export type PPMDayMode = 'monthDays' | 'weekdayOrdinals';
export type PPMHolidayPolicy = 'ignore' | 'skip' | 'nextBusinessDay' | 'previousBusinessDay';

export type PPMDayRejection =
  | 'BEFORE_START'
  | 'AFTER_END'
  | 'MONTH_NOT_ACTIVE'
  | 'DAY_NOT_ACTIVE'
  | 'SKIPPED_DATE'
  | 'HOLIDAY';

export interface PPMDayEvaluation {
  valid: boolean;
  rejection?: PPMDayRejection;
}

/**
 * Regla de recurrencia de un plan. Es un tamiz de filtros que van de más a menos:
 * meses activos → días dentro del mes → excepciones. Cada día que sobrevive
 * genera exactamente una orden de trabajo.
 *
 * `months` y `monthDays` se guardan SIEMPRE expandidos (nada de "cada N meses"
 * con fecha ancla) para que la generación sea determinista y auditable.
 */
export interface PPMRecurrence {
  timezone: string;
  startDate: string; // "YYYY-MM-DD"
  end: { type: 'never' } | { type: 'onDate'; until: string };
  months: number[]; // 1-12 expandidos: bimestral desde agosto => [2,4,6,8,10,12]
  dayMode: PPMDayMode;
  monthDays: number[]; // expandidos; -1 = último día del mes
  weekdays: PPMWeekday[];
  ordinals: number[]; // 1..5 = enésima aparición del día de semana; -1 = última
  skipDates: string[];
  extraDates: string[];
  holiday: PPMHolidayPolicy;
}

/**
 * Estado de materialización de una OT recurrente. La Cloud Function avanza el
 * cursor `generatedThrough` conforme genera órdenes de trabajo.
 */
export interface PPMGeneration {
  horizonDays: number;
  generatedThrough: string | null; // cursor "YYYY-MM-DD"
  lastRunAt: string | null;
  version: number;
}


