// adapters/index.ts
// Barrel — importa desde aquí en lugar de rutas individuales

export { getChecklistByIdAdapter } from "./getChecklistByIdAdapter";
export { getRevisionByIdAdapter } from "./getRevisionByIdAdapter";

export { createRevisionAdapter } from "./createRevisionAdapter";
export type { CreateRevisionPayload } from "./createRevisionAdapter";

export { updateRevisionAdapter } from "./updateRevisionAdapter";
export type { UpdateRevisionPayload } from "./updateRevisionAdapter";

export { getActiveSchedulesAdapter } from "./getActiveSchedulesAdapter";
export type { ActiveScheduleResult } from "./getActiveSchedulesAdapter";

export { getSchedulesByDateAdapter } from "./getSchedulesByDateAdapter";
export type {
  GetSchedulesByDateParams,
  ScheduleByDateResult,
  ScheduleExecutionStatus,
} from "./getSchedulesByDateAdapter";

export { getScheduleComplianceByPeriodAdapter } from "./getScheduleComplianceByPeriodAdapter";
export type {
  GetScheduleComplianceParams,
  CompliancePeriodResult,
  CompliancePeriod,
} from "./getScheduleComplianceByPeriodAdapter";
