import React from 'react';
import { FiCalendar } from 'react-icons/fi';
import { READ_ONLY_FIELD_CLASS } from './ppmReadOnlyStyles';

const WEEKDAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const MINUTES_PER_HOUR = 60;

interface PPMExecutionTimeFieldsProps {
  /** Día de ejecución `YYYY-MM-DD`. Se muestra pero no se puede editar. */
  dateKey: string;
  startTime: string;
  endTime: string;
  /** Orden de Trabajo cerrada: las horas se leen, no se editan. */
  isReadOnly?: boolean;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
}

/**
 * Horario real de ejecución. El día viene fijado por la programación y solo se
 * editan las horas, de modo que una orden de trabajo no pueda moverse de fecha por error.
 */
export const PPMExecutionTimeFields: React.FC<PPMExecutionTimeFieldsProps> = ({
  dateKey,
  startTime,
  endTime,
  isReadOnly = false,
  onStartTimeChange,
  onEndTimeChange
}) => {
  const durationMinutes = calculateDurationMinutes(startTime, endTime);
  const timeInputClass = `w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary-gold/40 disabled:bg-slate-100 ${READ_ONLY_FIELD_CLASS}`;

  return (
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-primary-dark uppercase tracking-wider">Horario de ejecución</span>
        {durationMinutes !== null && (
          <span className="text-xs font-bold text-slate-600">{formatDuration(durationMinutes)}</span>
        )}
      </div>

      {/* Día fijo: se muestra para dar contexto, no es editable */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200">
        <FiCalendar className="w-4 h-4 text-slate-400 shrink-0" />
        <span className="text-xs font-bold text-slate-800">{formatDateKey(dateKey)}</span>
        <span className="text-[11px] text-slate-400 ml-auto">Día fijado por la programación</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Hora de inicio</label>
          <input
            type="time"
            disabled={isReadOnly}
            value={startTime}
            onChange={(e) => onStartTimeChange(e.target.value)}
            className={timeInputClass}
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Hora de fin</label>
          <input
            type="time"
            disabled={isReadOnly}
            value={endTime}
            onChange={(e) => onEndTimeChange(e.target.value)}
            className={timeInputClass}
          />
        </div>
      </div>

      {durationMinutes !== null && durationMinutes <= 0 && (
        <p className="text-[11px] font-semibold text-danger-700">
          La hora de fin debe ser posterior a la de inicio.
        </p>
      )}
    </div>
  );
};

/** Combina el día fijo con una hora local y devuelve un ISO completo. */
export const buildExecutionISO = (dateKey: string, time: string): string =>
  new Date(`${dateKey}T${time}:00`).toISOString();

/** Extrae la hora local `HH:MM` de un ISO; cadena vacía si no hay valor. */
export const extractTime = (isoDate?: string | null): string => {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

/** Minutos entre dos horas `HH:MM`; null si falta alguna. */
export const calculateDurationMinutes = (startTime: string, endTime: string): number | null => {
  if (!startTime || !endTime) return null;
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  return endHour * MINUTES_PER_HOUR + endMinute - (startHour * MINUTES_PER_HOUR + startMinute);
};

const formatDuration = (minutes: number): string => {
  if (minutes <= 0) return '—';
  const hours = Math.floor(minutes / MINUTES_PER_HOUR);
  const remainder = minutes % MINUTES_PER_HOUR;
  return hours > 0 ? `${hours} h ${remainder} min` : `${remainder} min`;
};

const formatDateKey = (dateKey: string): string => {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return `${WEEKDAY_LABELS[date.getUTCDay()]} ${day} de ${MONTH_LABELS[month - 1]} ${year}`;
};
