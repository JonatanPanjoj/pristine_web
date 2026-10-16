// components/ChecklistAreaBoards.tsx
// Analítica por área del periodo: área crítica, mapa de calor área × franja
// horaria y ranking de mayor incumplimiento. Todo se deriva de las ocurrencias
// ya cargadas (areaName, startTime y status), sin consultas adicionales.

import React, { useMemo } from 'react';
import { FiAlertTriangle, FiGrid, FiTrendingDown, FiMapPin } from 'react-icons/fi';
import { BoardsSectionHeading } from './BoardsSectionHeading';
import { ScheduleOccurrence } from '../adapters/getSchedulesByRangeAdapter';

// TODO: traer el objetivo desde configuración por sede/categoría.
const OBJETIVO = 70;
const RANKING_SIZE = 5;

/** Franjas horarias del mapa de calor, derivadas de la hora de inicio programada. */
const TIME_SLOTS = [
  { key: 'madrugada', label: '00–06', from: 0, to: 6 },
  { key: 'mañana', label: '06–12', from: 6, to: 12 },
  { key: 'tarde', label: '12–18', from: 12, to: 18 },
  { key: 'noche', label: '18–24', from: 18, to: 24 },
];

export interface AreaStats {
  areaId: number;
  name: string;
  done: number;
  total: number;
  pct: number;
  /** Cumplimiento por franja; null cuando no hay programaciones en esa franja. */
  slots: (number | null)[];
}

interface ChecklistAreaBoardsProps {
  occurrences: ScheduleOccurrence[];
}

export const ChecklistAreaBoards: React.FC<ChecklistAreaBoardsProps> = ({ occurrences }) => {
  const areas = useMemo<AreaStats[]>(() => buildAreaStats(occurrences), [occurrences]);
  const ranking = useMemo(() => [...areas].reverse().slice(0, RANKING_SIZE), [areas]);

  return (
    <section>
      <BoardsSectionHeading title="Analítica por área" hint="Dónde se está incumpliendo dentro de la sede" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <AreaHeatmap areas={areas} className="lg:col-span-7" />
        <WorstAreasRanking areas={ranking} className="lg:col-span-5" />
      </div>
    </section>
  );
};

/* ── Área crítica ─────────────────────────────────────────────────────────── */
export const CriticalAreaCard: React.FC<{ area: AreaStats | null; className?: string }> = ({ area, className = '' }) => (
  <div className={`bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] border-0 flex flex-col ${className}`}>
    <div className="px-6 py-5 border-b border-slate-100">
      <h3 className="font-bold text-slate-800 flex items-center gap-2">
        <FiAlertTriangle className="w-4 h-4 text-danger" /> Área crítica
      </h3>
      <p className="text-xs text-slate-500 mt-0.5">Menor cumplimiento del periodo</p>
    </div>

    <div className="p-6 flex-1 flex flex-col justify-center">
      {!area ? (
        <EmptyMessage />
      ) : (
        <div className="flex flex-col items-center text-center gap-3">
          <span className="w-14 h-14 rounded-full bg-danger-200/40 text-danger-700 flex items-center justify-center">
            <FiMapPin className="w-6 h-6" />
          </span>
          <div>
            <p className="text-[15px] font-bold text-slate-800 leading-tight" title={area.name}>{area.name}</p>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">QR {area.areaId}</p>
          </div>
          <p className={`text-[40px] font-bold leading-none tabular-nums ${area.pct < OBJETIVO ? 'text-danger' : 'text-success'}`}>
            {area.pct}%
          </p>
          <p className="text-[12px] text-slate-500">
            {area.done} de {area.total} ejecutadas
          </p>
          {area.pct < OBJETIVO && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-danger-200/30 text-danger-700 text-[11px] font-bold">
              <FiTrendingDown className="w-3 h-3" /> {OBJETIVO - area.pct}% bajo la meta
            </span>
          )}
        </div>
      )}
    </div>
  </div>
);

/* ── Mapa de calor área × franja horaria ──────────────────────────────────── */
const AreaHeatmap: React.FC<{ areas: AreaStats[]; className?: string }> = ({ areas, className = '' }) => (
  <div className={`bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] border-0 flex flex-col ${className}`}>
    <div className="px-6 py-5 border-b border-slate-100">
      <h3 className="font-bold text-slate-800 flex items-center gap-2">
        <FiGrid className="w-4 h-4 text-primary-gold" /> Mapa de calor (Área × Hora)
      </h3>
      <p className="text-xs text-slate-500 mt-0.5">Cumplimiento por franja horaria de la programación</p>
    </div>

    <div className="p-6 flex-1">
      {areas.length === 0 ? (
        <EmptyMessage />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr>
                <th className="pb-3 font-medium text-slate-500 text-xs">Área</th>
                {TIME_SLOTS.map((slot) => (
                  <th key={slot.key} className="pb-3 font-medium text-slate-500 text-center text-xs">{slot.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {areas.map((area) => (
                <tr key={area.areaId}>
                  <td className="py-1 pr-2 font-medium text-slate-700 text-xs truncate max-w-[120px]" title={area.name}>
                    {area.name}
                  </td>
                  {area.slots.map((value, index) => (
                    <td key={TIME_SLOTS[index].key} className="p-1">
                      <HeatCell value={value} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-slate-100">
            <LegendDot className="bg-success" label="≥ 90%" />
            <LegendDot className="bg-primary-gold" label="≥ 70%" />
            <LegendDot className="bg-danger" label="< 70%" />
            <LegendDot className="bg-slate-100 border border-slate-200" label="sin programación" />
          </div>
        </div>
      )}
    </div>
  </div>
);

const HeatCell: React.FC<{ value: number | null }> = ({ value }) => {
  if (value === null) {
    return <div className="w-full h-8 rounded-lg bg-slate-50 border border-slate-100" title="Sin programaciones" />;
  }

  const tone = value >= 90 ? 'bg-success text-white' : value >= OBJETIVO ? 'bg-primary-gold text-white' : 'bg-danger text-white';
  return (
    <div className={`w-full h-8 rounded-lg flex items-center justify-center text-[11px] font-bold tabular-nums ${tone}`}>
      {value}%
    </div>
  );
};

/* ── Ranking de mayor incumplimiento ──────────────────────────────────────── */
const WorstAreasRanking: React.FC<{ areas: AreaStats[]; className?: string }> = ({ areas, className = '' }) => (
  <div className={`bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] border-0 flex flex-col ${className}`}>
    <div className="px-6 py-5 border-b border-slate-100">
      <h3 className="font-bold text-slate-800 flex items-center gap-2">
        <FiTrendingDown className="w-4 h-4 text-danger" /> Áreas con mayor incumplimiento
      </h3>
      <p className="text-xs text-slate-500 mt-0.5">Las {RANKING_SIZE} con peor cumplimiento del periodo</p>
    </div>

    <div className="p-6 flex-1">
      {areas.length === 0 ? (
        <EmptyMessage />
      ) : (
        <div className="space-y-4">
          {areas.map((area, index) => (
            <div key={area.areaId} className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline gap-2 text-sm mb-1">
                  <span className="font-medium text-slate-700 truncate" title={area.name}>{area.name}</span>
                  <span className={`font-bold tabular-nums shrink-0 ${area.pct < OBJETIVO ? 'text-danger' : 'text-success'}`}>
                    {area.pct}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${area.pct < OBJETIVO ? 'bg-danger' : 'bg-success'}`}
                    style={{ width: `${area.pct}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  {area.done}/{area.total} ejecutadas · QR {area.areaId}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

/* ── Derivados y auxiliares ───────────────────────────────────────────────── */

/** Agrupa por área y calcula cumplimiento global y por franja horaria. */
export const buildAreaStats = (occurrences: ScheduleOccurrence[]): AreaStats[] => {
  const groups: Record<string, {
    areaId: number; name: string; done: number; total: number;
    slots: { done: number; total: number }[];
  }> = {};

  occurrences.forEach((occurrence) => {
    const key = String(occurrence.areaId);
    if (!groups[key]) {
      groups[key] = {
        areaId: occurrence.areaId,
        name: occurrence.areaName || `Área ${occurrence.areaId}`,
        done: 0,
        total: 0,
        slots: TIME_SLOTS.map(() => ({ done: 0, total: 0 })),
      };
    }

    const group = groups[key];
    const isDone = occurrence.status === 'completed';
    group.total++;
    if (isDone) group.done++;

    const slotIndex = slotIndexOf(occurrence.startTime);
    if (slotIndex >= 0) {
      group.slots[slotIndex].total++;
      if (isDone) group.slots[slotIndex].done++;
    }
  });

  return Object.values(groups)
    .map((group) => ({
      areaId: group.areaId,
      name: group.name,
      done: group.done,
      total: group.total,
      pct: Math.round((group.done / group.total) * 100),
      slots: group.slots.map((slot) => (slot.total === 0 ? null : Math.round((slot.done / slot.total) * 100))),
    }))
    .sort((a, b) => b.pct - a.pct);
};

/** Índice de la franja horaria a la que pertenece un "HH:mm". */
const slotIndexOf = (startTime: string): number => {
  const hour = Number(startTime?.slice(0, 2));
  if (Number.isNaN(hour)) return -1;
  return TIME_SLOTS.findIndex((slot) => hour >= slot.from && hour < slot.to);
};

const LegendDot: React.FC<{ className: string; label: string }> = ({ className, label }) => (
  <span className="inline-flex items-center gap-1.5">
    <span className={`w-2.5 h-2.5 rounded-sm ${className}`} />
    <span className="text-[10px] font-semibold text-slate-500">{label}</span>
  </span>
);

const EmptyMessage: React.FC = () => (
  <p className="text-[13px] text-slate-400 py-8 text-center">Sin datos en este periodo</p>
);

export default ChecklistAreaBoards;
