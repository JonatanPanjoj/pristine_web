/**
 * Duraciones en el formato `HH:MM:SS` que ya usa el resto de la aplicación.
 *
 * Se guarda el texto y no un número de minutos porque es lo que leen las demás
 * pantallas y los reportes: cambiar la unidad aquí obligaría a migrarlas todas.
 */
export const EMPTY_DURATION = '00:00:00';

export interface DurationParts {
  hours: number;
  minutes: number;
}

export const parseDuration = (value?: string): DurationParts => {
  const [hours, minutes] = (value || '').split(':');
  return {
    hours: toNumber(hours),
    minutes: toNumber(minutes),
  };
};

export const buildDuration = (hours: number, minutes: number): string =>
  `${pad(Math.max(0, hours))}:${pad(clampMinutes(minutes))}:00`;

/** Cómo se lee en una tabla: `3h 30m`, `5m`, o un guion si no hay tiempo. */
export const describeDuration = (value?: string): string => {
  const { hours, minutes } = parseDuration(value);
  if (hours === 0 && minutes === 0) return '-';

  return [hours > 0 ? `${hours}h` : '', minutes > 0 ? `${minutes}m` : '']
    .filter(Boolean)
    .join(' ');
};

/** La duración en horas, que es como se compara contra el reloj. */
export const durationToHours = (value?: string): number => {
  const { hours, minutes } = parseDuration(value);
  return hours + minutes / 60;
};

const toNumber = (value?: string): number => {
  const parsed = parseInt(value || '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

const clampMinutes = (minutes: number): number => Math.min(59, Math.max(0, minutes));

const pad = (value: number): string => String(value).padStart(2, '0');
