// utils/dateRange.ts
// Manejo de fechas de los filtros de reportes. Las revisiones guardan `startDate`
// como instante UTC (`new Date().toISOString()`), pero el usuario filtra por DÍAS
// en su hora local. Convertir un día a rango requiere dos cosas:
//   1. interpretar el "YYYY-MM-DD" del <input type="date"> como día LOCAL, no UTC
//      (`new Date("2026-08-06")` es medianoche UTC → en GT es el día 5 a las 18:00);
//   2. consultar de 00:00:00.000 a 23:59:59.999 de ese día local.
// Sin (2), buscar "del 6 al 6" produce un rango de longitud cero y no devuelve nada.

/** Inicio del día local (00:00:00.000). */
export const atStartOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

/** Fin del día local (23:59:59.999). */
export const atEndOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

/**
 * Convierte el valor de un <input type="date"> ("YYYY-MM-DD") en un Date del día
 * local, evitando el desfase de un día que produce `new Date(value)`.
 */
export const parseDateInput = (value: string): Date => {
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return new Date();
  return new Date(year, month - 1, day);
};

/** Formatea un Date como "YYYY-MM-DD" usando sus componentes locales. */
export const toDateInputValue = (date: Date): string => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

/** Rango ISO que cubre por completo los días local indicados, extremos incluidos. */
export const toIsoDayRange = (startDate: Date, endDate: Date) => ({
  startIso: atStartOfDay(startDate).toISOString(),
  endIso: atEndOfDay(endDate).toISOString(),
});

export type PeriodKey = 'day' | 'week' | 'month';

export interface PeriodRange {
  start: Date;
  end: Date;
  /** Texto legible del periodo, para dejar claro qué se está mostrando. */
  label: string;
  dayCount: number;
}

const LOCALE = 'es-GT';

/** Convierte una fecha ancla en el rango del periodo elegido (semana de lunes a domingo). */
export const buildPeriodRange = (period: PeriodKey, anchor: Date): PeriodRange => {
  if (period === 'week') {
    const start = atStartOfDay(anchor);
    const weekdayOffset = (start.getDay() + 6) % 7; // lunes = 0
    start.setDate(start.getDate() - weekdayOffset);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start, end: atEndOfDay(end), label: `Semana del ${formatDay(start)} al ${formatDay(end)}`, dayCount: 7 };
  }

  if (period === 'month') {
    const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
    const monthLabel = start.toLocaleDateString(LOCALE, { month: 'long', year: 'numeric' });
    return { start, end: atEndOfDay(end), label: capitalize(monthLabel), dayCount: end.getDate() };
  }

  const day = atStartOfDay(anchor);
  const label = day.toLocaleDateString(LOCALE, { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  return { start: day, end: atEndOfDay(anchor), label: capitalize(label), dayCount: 1 };
};

const formatDay = (date: Date) => date.toLocaleDateString(LOCALE, { day: '2-digit', month: 'short' });

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
