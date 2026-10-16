// src/pages/AutomaticReports/constants/reportSchedule.ts
import {
  AutomaticReportModule,
  AutomaticReportPeriod,
} from "../../../models/AutomaticReport";

export const DEFAULT_REPORT_HOUR = "23:00";

interface PeriodOption {
  value: AutomaticReportPeriod;
  label: string;
}

// Checklist y PPM consolidan rangos largos; el resto de módulos envía el día.
const LONG_PERIODS: PeriodOption[] = [
  { value: "semana", label: "Semana pasada" },
  { value: "quincena", label: "Quincena pasada" },
  { value: "mes", label: "Mes pasado" },
  { value: "semestre", label: "Semestre pasado" },
  { value: "anio", label: "Año pasado" },
];

const DAILY_PERIOD: PeriodOption[] = [{ value: "dia", label: "Día anterior" }];

export const WEEK_DAYS = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 0, label: "Domingo" },
];

/**
 * Módulos que consolidan un rango cerrado y por tanto eligen período y día de
 * envío. El resto manda el consolidado del día anterior.
 */
const LONG_PERIOD_MODULES: AutomaticReportModule[] = ["checklist", "ppm"];

export const isChecklistModule = (module: AutomaticReportModule): boolean =>
  LONG_PERIOD_MODULES.includes(module);

export const getPeriodOptions = (module: AutomaticReportModule): PeriodOption[] =>
  isChecklistModule(module) ? LONG_PERIODS : DAILY_PERIOD;

export const getDefaultPeriod = (
  module: AutomaticReportModule
): AutomaticReportPeriod => (isChecklistModule(module) ? "semana" : "dia");

export const getPeriodLabel = (period: AutomaticReportPeriod): string => {
  const option = [...LONG_PERIODS, ...DAILY_PERIOD].find(
    (p) => p.value === period
  );
  return option ? option.label : "—";
}; // cierra export const getPeriodLabel

export const getWeekDayLabel = (day?: number | null): string => {
  const option = WEEK_DAYS.find((d) => d.value === day);
  return option ? option.label : "—";
}; // cierra export const getWeekDayLabel
