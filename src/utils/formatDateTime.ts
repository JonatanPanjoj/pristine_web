const EMPTY_PLACEHOLDER = 'Pendiente';

export const parseDate = (value: unknown): Date | null => {
  if (!value) return null;
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }
  if (typeof (value as { toDate?: () => Date }).toDate === 'function') {
    const d = (value as { toDate: () => Date }).toDate();
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === 'object' && value !== null) {
    const obj = value as { seconds?: number; _seconds?: number };
    const seconds = obj.seconds ?? obj._seconds;
    if (typeof seconds === 'number') {
      const d = new Date(seconds * 1000);
      return isNaN(d.getTime()) ? null : d;
    }
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
};

export const formatShortDate = (
  value: unknown,
  locale = 'es-GT',
  options: Intl.DateTimeFormatOptions = { month: 'numeric', day: 'numeric', year: 'numeric' }
): string => {
  const d = parseDate(value);
  if (!d) return '—';
  return d.toLocaleDateString(locale, options);
};

export const formatFullDateTime = (
  value: unknown,
  locale = 'es-ES',
  options: Intl.DateTimeFormatOptions = { dateStyle: 'short', timeStyle: 'short' }
): string => {
  const d = parseDate(value);
  if (!d) return '—';
  return d.toLocaleString(locale, options);
};

export const formatAuditoriaDateTime = (value?: string): string => {
  if (!value) return EMPTY_PLACEHOLDER;
  const parsed = parseDate(value);
  if (!parsed) return EMPTY_PLACEHOLDER;
  return `${parsed.toLocaleDateString()} · ${parsed.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
};

export const formatAuditoriaDate = (value?: string): string => {
  if (!value) return EMPTY_PLACEHOLDER;
  const parsed = parseDate(value);
  return !parsed ? EMPTY_PLACEHOLDER : parsed.toLocaleDateString();
};

