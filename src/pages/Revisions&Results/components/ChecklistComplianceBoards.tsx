// components/ChecklistComplianceBoards.tsx
// Tableros de cumplimiento con el lenguaje visual premium (barras píldora, línea
// de meta punteada, chips dorados) alimentados con el desglose por estado y los
// resultados Sí/No de cada revisión. Todo se deriva en memoria de las
// ocurrencias ya cargadas: no añade ni una consulta.

import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { FiAlertTriangle } from 'react-icons/fi';
import { BoardsSectionHeading } from './BoardsSectionHeading';
import { ScheduleOccurrence } from '../adapters/getSchedulesByRangeAdapter';
import { CriticalAreaCard, buildAreaStats } from './ChecklistAreaBoards';

// TODO: traer el objetivo desde configuración por sede/categoría.
const OBJETIVO = 70;

const TONE = {
  done: { bar: 'bg-success', dot: 'bg-success', hex: '#34AB45', label: 'Ejecutado' },
  pending: { bar: 'bg-attention', dot: 'bg-attention', hex: '#F1A604', label: 'Pendiente' },
  overdue: { bar: 'bg-danger', dot: 'bg-danger', hex: '#DA1E37', label: 'Vencido' },
};

/** Cifras del periodo completo, sin abrir por categoría. */
interface PeriodTotals {
  total: number;
  done: number;
  pending: number;
  overdue: number;
  donePct: number;
  pendingPct: number;
  overduePct: number;
  yes: number;
  no: number;
  yesPct: number;
}

interface CategoryBreakdown {
  name: string;
  donePct: number;
  pendingPct: number;
  overduePct: number;
  yes: number;
  no: number;
  yesPct: number;
}

interface ChecklistComplianceBoardsProps {
  occurrences: ScheduleOccurrence[];
  periodLabel: string;
}

export const ChecklistComplianceBoards: React.FC<ChecklistComplianceBoardsProps> = ({
  occurrences,
  periodLabel,
}) => {
  const totals = useMemo<PeriodTotals>(() => {
    const total = occurrences.length;
    const done = occurrences.filter((o) => o.status === 'completed').length;
    const pending = occurrences.filter((o) => o.status === 'pending' || o.status === 'in_progress').length;
    const overdue = occurrences.filter((o) => o.status === 'overdue').length;
    const toPct = (n: number) => (total ? Math.round((n / total) * 100) : 0);

    const yes = occurrences.reduce((acc, o) => acc + o.totalYes, 0);
    const no = occurrences.reduce((acc, o) => acc + o.totalNo, 0);

    return {
      total, done, pending, overdue,
      donePct: toPct(done), pendingPct: toPct(pending), overduePct: toPct(overdue),
      yes, no, yesPct: yes + no > 0 ? Math.round((yes / (yes + no)) * 100) : 0,
    };
  }, [occurrences]);

  const categories = useMemo<CategoryBreakdown[]>(() => {
    const groups: Record<string, { total: number; done: number; pending: number; overdue: number; yes: number; no: number }> = {};

    occurrences.forEach((occurrence) => {
      const key = occurrence.categoryName || 'Sin categoría';
      if (!groups[key]) groups[key] = { total: 0, done: 0, pending: 0, overdue: 0, yes: 0, no: 0 };
      const group = groups[key];
      group.total++;
      if (occurrence.status === 'completed') group.done++;
      else if (occurrence.status === 'overdue') group.overdue++;
      else group.pending++;
      group.yes += occurrence.totalYes;
      group.no += occurrence.totalNo;
    });

    return Object.entries(groups)
      .map(([name, g]) => ({
        name,
        donePct: Math.round((g.done / g.total) * 100),
        pendingPct: Math.round((g.pending / g.total) * 100),
        overduePct: Math.round((g.overdue / g.total) * 100),
        yes: g.yes,
        no: g.no,
        yesPct: g.yes + g.no > 0 ? Math.round((g.yes / (g.yes + g.no)) * 100) : 0,
      }))
      .sort((a, b) => b.donePct - a.donePct);
  }, [occurrences]);

  const worstCategory = categories.length ? categories[categories.length - 1] : null;
  const categoriesWithAnswers = categories.filter((c) => c.yes + c.no > 0);

  return (
    // Dos lecturas distintas, dos bloques: primero cómo va el periodo completo y
    // después ese mismo periodo abierto por categoría.
    <div className="flex flex-col gap-8">
      <section>
        <BoardsSectionHeading title="Gráficas globales" hint="El periodo completo, sin desglosar" />
        <GlobalBoards totals={totals} periodLabel={periodLabel} occurrences={occurrences} />
      </section>

      <section>
        <BoardsSectionHeading title="Gráficas por categoría" hint="El mismo periodo abierto por categoría" />
        <CategoryBoards
          categories={categories}
          categoriesWithAnswers={categoriesWithAnswers}
          worstCategory={worstCategory}
          totals={totals}
          periodLabel={periodLabel}
        />
      </section>
    </div>
  );
};

/* ── Bloque global ────────────────────────────────────────────────────────── */

// Rejilla de 12 columnas: cada tablero ocupa el ancho que merece según la
// densidad de su información, en vez de repartir todo por igual.
const GlobalBoards: React.FC<{ totals: PeriodTotals; periodLabel: string; occurrences: ScheduleOccurrence[] }> = ({
  totals,
  periodLabel,
  occurrences,
}) => {
  const areas = useMemo(() => buildAreaStats(occurrences), [occurrences]);
  const worstArea = areas.length ? areas[areas.length - 1] : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Distribución del periodo en barras píldora */}
      <BoardCard title="Cumplimiento del periodo" chip={periodLabel} className="lg:col-span-5">
        <div className="flex items-end justify-center gap-6 sm:gap-8 pt-8 pb-2">
          <PillBar pct={totals.donePct} tone={TONE.done} detail={[`${totals.done} de ${totals.total} ejecutadas`]} />
          <PillBar pct={totals.pendingPct} tone={TONE.pending} detail={[`${totals.pending} sin ejecutar aún`]} />
          <PillBar pct={totals.overduePct} tone={TONE.overdue} detail={[`${totals.overdue} fuera de horario`]} />
        </div>
        <Legend
          items={[
            { ...TONE.done, text: `${totals.donePct}% Ejecutado` },
            { ...TONE.pending, text: `${totals.pendingPct}% Pendiente` },
            { ...TONE.overdue, text: `${totals.overduePct}% Vencido` },
          ]}
        />
      </BoardCard>

      {/* Resultado general en semicírculo — junto a las barras, ambos son resumen */}
      <BoardCard title="Respuestas en general" chip="Sí / No" className="lg:col-span-4">
        <GeneralGauge yesPct={totals.yesPct} yes={totals.yes} no={totals.no} />
      </BoardCard>

      {/* Área crítica — Menor cumplimiento del periodo */}
      <CriticalAreaCard area={worstArea} className="lg:col-span-3" />
    </div>
  );
};

/* ── Bloque por categoría ─────────────────────────────────────────────────── */

interface CategoryBoardsProps {
  categories: CategoryBreakdown[];
  categoriesWithAnswers: CategoryBreakdown[];
  worstCategory: CategoryBreakdown | null;
  totals: PeriodTotals;
  periodLabel: string;
}

const CategoryBoards: React.FC<CategoryBoardsProps> = ({
  categories,
  categoriesWithAnswers,
  worstCategory,
  totals,
  periodLabel,
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
    {/* Cumplimiento por categoría, desglosado por estado */}
    <BoardCard title="Cumplimiento por categoría" chip={periodLabel} className="lg:col-span-5">
      <div className="flex flex-col gap-3.5 py-4">
        {categories.length === 0 && <EmptyBoard />}
        {categories.map((category, index) => (
          <StackedCategoryRow key={category.name} rank={index + 1} category={category} />
        ))}
      </div>

      {worstCategory && worstCategory.donePct < OBJETIVO && (
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-gold text-white shadow-[0_4px_12px_rgba(221,152,3,0.25)]">
          <FiAlertTriangle className="w-3.5 h-3.5" />
          <span className="text-[12px] font-bold">
            {worstCategory.name} tiene bajo cumplimiento ({worstCategory.donePct}%)
          </span>
        </div>
      )}

      <Legend items={[TONE.done, TONE.pending, TONE.overdue].map((t) => ({ ...t, text: t.label }))} />
    </BoardCard>

    {/* Respuestas Sí/No por categoría */}
    <BoardCard title="Respuestas por categoría" chip="Sí / No de cada revisión" className="lg:col-span-7">
      <div className="flex flex-col gap-3.5 py-4 w-full">
        {categoriesWithAnswers.length === 0 && <EmptyBoard message="Aún no hay revisiones respondidas" />}
        {categoriesWithAnswers.map((category) => (
          <AnswersRow key={category.name} category={category} />
        ))}
      </div>
      <Legend
        items={[
          { dot: 'bg-success', text: `Sí (${totals.yes})` },
          { dot: 'bg-danger', text: `No (${totals.no})` },
        ]}
      />
    </BoardCard>
  </div>
);

/* ── Tarjeta base ─────────────────────────────────────────────────────────── */
const BoardCard: React.FC<{ title: string; chip: string; className?: string; children: React.ReactNode }> = ({
  title,
  chip,
  className = '',
  children,
}) => (
  <div className={`bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] border-0 px-6 py-6 flex flex-col items-center ${className}`}>
    <h3 className="text-[17px] font-bold text-slate-800">{title}</h3>
    <span className="mt-2 inline-flex items-center px-4 py-1 rounded-full bg-primary-gold text-white text-[11px] font-bold shadow-[0_4px_12px_rgba(221,152,3,0.25)] max-w-full truncate">
      {chip}
    </span>
    <div className="w-full flex flex-col items-center flex-1">{children}</div>
  </div>
);

/* ── Barra píldora vertical con línea de meta ─────────────────────────────── */
const PillBar: React.FC<{ pct: number; tone: { bar: string; label: string }; detail: string[] }> = ({
  pct,
  tone,
  detail,
}) => {
  const [hover, setHover] = useState(false);

  return (
    <div className="flex flex-col items-center gap-3 relative">
      <div
        className="relative"
        style={{ width: 56, height: 210 }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div className="absolute inset-0 rounded-t-[28px] rounded-b-lg bg-surface-app border border-slate-200" />
        <div className="absolute left-[-10px] right-[-4px] border-t border-dashed border-slate-400" style={{ bottom: `${OBJETIVO}%` }}>
          <span className="absolute -top-4 -left-1 text-[9px] font-semibold text-slate-400">Meta</span>
        </div>
        <div
          className={`absolute bottom-0 left-0 right-0 rounded-t-[28px] rounded-b-lg transition-all duration-500 ${tone.bar}`}
          style={{ height: `${pct}%` }}
        />
        <span
          className="absolute left-1/2 -translate-x-1/2 text-[14px] font-bold tabular-nums text-slate-800"
          style={{ bottom: `calc(${pct}% + 8px)` }}
        >
          {pct}%
        </span>

        {hover && (
          <div className="absolute z-20 left-1/2 -translate-x-1/2 bottom-full mb-2 w-44 p-3 rounded-2xl text-left bg-primary shadow-lg">
            <p className="text-[12px] font-semibold mb-1 text-white">{tone.label}</p>
            {detail.map((line) => (
              <p key={line} className="text-[11px] text-white/75">{line}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Fila de categoría apilada por estado ─────────────────────────────────── */
const StackedCategoryRow: React.FC<{ rank: number; category: CategoryBreakdown }> = ({ rank, category }) => (
  <div className="flex items-center gap-3 w-full">
    <span className="text-[11px] font-semibold w-4 text-right tabular-nums text-slate-300">{rank}</span>
    <span className="text-[13px] font-medium w-28 shrink-0 truncate text-slate-800" title={category.name}>
      {category.name}
    </span>
    <div className="relative flex-1 h-5 rounded-full overflow-hidden bg-surface-app border border-slate-200 flex">
      <div className="absolute top-0 bottom-0 border-l border-dashed border-slate-400 z-10" style={{ left: `${OBJETIVO}%` }} />
      <div className={TONE.done.bar} style={{ width: `${category.donePct}%` }} />
      <div className={TONE.pending.bar} style={{ width: `${category.pendingPct}%` }} />
      <div className={TONE.overdue.bar} style={{ width: `${category.overduePct}%` }} />
    </div>
    <span
      className={`text-[12px] font-bold w-10 text-right tabular-nums ${
        category.donePct < OBJETIVO ? 'text-danger-700' : 'text-success-700'
      }`}
    >
      {category.donePct}%
    </span>
  </div>
);

/* ── Fila de respuestas Sí / No ───────────────────────────────────────────── */
const AnswersRow: React.FC<{ category: CategoryBreakdown }> = ({ category }) => (
  <div className="flex items-center gap-3 w-full">
    <span className="text-[13px] font-medium w-28 shrink-0 truncate text-slate-800" title={category.name}>
      {category.name}
    </span>
    <div className="relative flex-1 h-5 rounded-full overflow-hidden bg-surface-app border border-slate-200 flex">
      <div className="bg-success" style={{ width: `${category.yesPct}%` }} />
      <div className="bg-danger" style={{ width: `${100 - category.yesPct}%` }} />
    </div>
    <span className="text-[12px] font-bold w-14 text-right tabular-nums text-slate-700">
      {category.yes}/{category.yes + category.no}
    </span>
  </div>
);

/* ── Semicírculo de conformidad general ───────────────────────────────────── */
const GeneralGauge: React.FC<{ yesPct: number; yes: number; no: number }> = ({ yesPct, yes, no }) => {
  const data = [
    { name: 'Conforme', value: yesPct, color: TONE.done.hex },
    { name: 'No conforme', value: 100 - yesPct, color: TONE.overdue.hex },
  ];

  return (
    <div className="w-full flex flex-col items-center">
      <div className="relative w-full h-[190px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="85%"
              startAngle={180}
              endAngle={0}
              innerRadius={70}
              outerRadius={110}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-x-0 bottom-2 flex flex-col items-center pointer-events-none">
          <span className="text-[34px] font-bold leading-none tabular-nums text-slate-800">{yesPct}%</span>
          <span className="text-[11px] font-semibold text-slate-400 mt-1">respuestas Sí</span>
        </div>
      </div>

      {yes + no === 0 ? (
        <EmptyBoard message="Aún no hay revisiones respondidas" />
      ) : (
        <Legend
          items={[
            { dot: 'bg-success', text: `${yes} Sí` },
            { dot: 'bg-danger', text: `${no} No` },
          ]}
        />
      )}
    </div>
  );
};

/* ── Auxiliares ───────────────────────────────────────────────────────────── */
const Legend: React.FC<{ items: { dot: string; text: string }[] }> = ({ items }) => (
  <div className="flex flex-wrap items-center justify-center gap-4 mt-5 pt-4 border-t border-slate-100 w-full">
    {items.map((item) => (
      <span key={item.text} className="inline-flex items-center gap-1.5">
        <span className={`w-2.5 h-2.5 rounded-sm ${item.dot}`} />
        <span className="text-[11px] font-semibold text-slate-700">{item.text}</span>
      </span>
    ))}
  </div>
);

const EmptyBoard: React.FC<{ message?: string }> = ({ message = 'Sin datos en este periodo' }) => (
  <p className="text-[13px] text-slate-400 py-6 text-center w-full">{message}</p>
);

export default ChecklistComplianceBoards;
