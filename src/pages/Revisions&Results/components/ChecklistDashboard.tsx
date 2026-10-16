// ChecklistDashboard.tsx
// Estadísticas de cumplimiento (Checklist). Sigue el orden de /checkList/dashboard:
// cabecera con el nombre, panel de filtros colapsable y luego los indicadores.
//
// El periodo (Día / Semana / Mes) se resuelve con UNA consulta de programaciones
// y otra de revisiones para todo el rango — ver getSchedulesByRangeAdapter — así
// que cambiar de día a mes no multiplica las lecturas de Firestore.

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiCheckCircle, FiClock, FiAlertTriangle, FiBarChart2, FiMapPin } from 'react-icons/fi';
import { IconType } from 'react-icons';
import Loader from '../../../components/Loader';
import { KPICard } from '../../ChecklistDashboard/components/KPICard';
import ChecklistTrendChart from './ChecklistTrendChart';
import ChecklistComplianceBoards from './ChecklistComplianceBoards';
import ChecklistAreaBoards from './ChecklistAreaBoards';
import ChecklistComplianceFilters, { ComplianceFilterValues } from './ChecklistComplianceFilters';
import ScheduleStatusAccordion, { StatusMeta } from './ScheduleStatusAccordion';
import { useSchedulesByRange } from '../hooks/useSchedulesByRange';
import { ScheduleExecutionStatus } from '../adapters/getSchedulesByDateAdapter';
import { buildPeriodRange } from '../utils/dateRange';
import useEnabledSedesForUser from '../../../components/sedesEnabled/hooks/useEnabledSedesForUser';
import useMenuLinks from '../../../route/routerLink/useMenuLinks';

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const STATUS: Record<ScheduleExecutionStatus, StatusMeta> = {
  completed: { label: 'Ejecutada', softBg: 'bg-success-200/50', softText: 'text-success-700', Icon: FiCheckCircle },
  in_progress: { label: 'En proceso', softBg: 'bg-action-200/50', softText: 'text-action-700', Icon: FiClock },
  pending: { label: 'Pendiente', softBg: 'bg-attention-200/50', softText: 'text-attention-700', Icon: FiClock },
  overdue: { label: 'Vencida', softBg: 'bg-danger-200/40', softText: 'text-danger-700', Icon: FiAlertTriangle },
};

const STATUS_TABS = ['Todos', 'Vencidos', 'Pendientes', 'Completados'] as const;
type StatusTab = typeof STATUS_TABS[number];

const emptyFilters = (): ComplianceFilterValues => ({
  sedeId: '',
  sectorId: '',
  categoryId: '',
  period: 'day',
  anchorDate: new Date(),
});

const ChecklistDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { getLinkByName } = useMenuLinks();
  const { data, loading, error, fetchRange } = useSchedulesByRange();
  const { sedes } = useEnabledSedesForUser();

  // `filters` es lo que se está editando en el panel; `applied` lo que ya se
  // consultó. El contexto de la cabecera muestra `applied` para no anunciar un
  // periodo que todavía no se ha buscado.
  const [filters, setFilters] = useState<ComplianceFilterValues>(emptyFilters);
  const [applied, setApplied] = useState<ComplianceFilterValues>(emptyFilters);
  const [tab, setTab] = useState<StatusTab>('Todos');

  const range = useMemo(() => buildPeriodRange(applied.period, applied.anchorDate), [applied]);
  const sedeName = applied.sedeId
    ? sedes.find((s) => s.id === applied.sedeId)?.name ?? ''
    : 'Todas las sedes';

  const runSearch = useCallback(
    (values: ComplianceFilterValues) => {
      const { start, end } = buildPeriodRange(values.period, values.anchorDate);
      setApplied(values);
      fetchRange({
        startDate: start,
        endDate: end,
        sedeId: values.sedeId,
        sectorId: values.sectorId || null,
        categoryId: values.categoryId || null,
      });
    },
    [fetchRange],
  );

  // Primera carga: todas las sedes del usuario. Antes esperaba a que llegara el
  // listado para consultar solo la primera, y quien tiene varias veía una sola
  // sin haberlo pedido.
  useEffect(() => {
    runSearch(emptyFilters());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReset = () => {
    const initial = emptyFilters();
    setFilters(initial);
    runSearch(initial);
  };

  /* ── derivados ── */
  const occurrences = useMemo(() => data ?? [], [data]);
  const total = occurrences.length;

  const counts = useMemo(() => {
    const acc: Record<ScheduleExecutionStatus, number> = { completed: 0, in_progress: 0, pending: 0, overdue: 0 };
    occurrences.forEach((o) => { acc[o.status]++; });
    return acc;
  }, [occurrences]);

  const compliance = total ? Math.round((counts.completed / total) * 100) : 0;

  const visibleGroups = useMemo<ScheduleExecutionStatus[]>(() => {
    const withInProgress = counts.in_progress > 0;
    switch (tab) {
      case 'Vencidos': return ['overdue'];
      case 'Pendientes': return withInProgress ? ['pending', 'in_progress'] : ['pending'];
      case 'Completados': return ['completed'];
      default: return withInProgress
        ? ['overdue', 'in_progress', 'pending', 'completed']
        : ['overdue', 'pending', 'completed'];
    }
  }, [tab, counts.in_progress]);

  const rowsFor = (status: ScheduleExecutionStatus) => occurrences.filter((o) => o.status === status);

  const openRevision = (revisionId: string) =>
    navigate(getLinkByName('revisionDetail').replace(':revisionId', revisionId));

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="min-h-full p-6 lg:p-8 flex flex-col gap-6">
      {/* 1. Cabecera con el nombre del tablero */}
      <motion.div variants={cardVariants} className="bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] px-6 py-6 md:px-8 md:py-8 border-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center">
              <FiBarChart2 className="w-6 h-6 mr-3 text-primary-gold" />
              Estadísticas de cumplimiento
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Seguimiento de programaciones, ejecuciones y cumplimiento por sede y periodo
            </p>
          </div>

          {/* Contexto de lo que se está mostrando ahora mismo */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <ContextChip icon={FiMapPin} label={sedeName || 'Selecciona una sede'} highlighted />
            <ContextChip icon={FiCalendar} label={range.label} />
          </div>
        </div>
      </motion.div>

      {/* 2. Filtros colapsables */}
      <motion.div variants={cardVariants}>
        <ChecklistComplianceFilters
          values={filters}
          onChange={setFilters}
          onSearch={runSearch}
          onReset={handleReset}
        />
      </motion.div>

      {/* 3. KPIs */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Cumplimiento del periodo" value={`${compliance}%`} icon={<FiCheckCircle className="w-6 h-6" />} status="success" progress={compliance} />
        <KPICard title="Vencidas" value={counts.overdue} icon={<FiAlertTriangle className="w-6 h-6" />} status="danger" />
        <KPICard title="Pendientes" value={counts.pending} icon={<FiClock className="w-6 h-6" />} status="warning" />
        <KPICard title="Ejecutadas" value={counts.completed} icon={<FiCheckCircle className="w-6 h-6" />} status="primary" />
      </motion.div>

      {/* 4. Tableros de cumplimiento (barras píldora, categorías, respuestas) */}
      <motion.div variants={cardVariants}>
        <ChecklistComplianceBoards occurrences={occurrences} periodLabel={range.label} />
      </motion.div>

      {/* 5. Analítica por área: peor área, mapa de calor y ranking */}
      <motion.div variants={cardVariants}>
        <ChecklistAreaBoards occurrences={occurrences} />
      </motion.div>

      {/* 6. Tendencia: solo aporta en periodos de más de un día */}
      {range.dayCount > 1 && (
        <motion.div variants={cardVariants}>
          <ChecklistTrendChart occurrences={occurrences} />
        </motion.div>
      )}

      {/* 7. Detalle operativo */}
      <motion.div variants={cardVariants}>
        <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] border-0">
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-800">Programaciones del periodo</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {sedeName} · {range.label} · {total} programación{total !== 1 ? 'es' : ''}
              </p>
            </div>
            <div className="bg-primary p-1 rounded-full inline-flex gap-1">
              {STATUS_TABS.map((option) => (
                <button key={option} onClick={() => setTab(option)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all active:scale-95 ${
                    tab === option ? 'bg-primary-gold text-white shadow-[0_4px_12px_rgba(221,152,3,0.25)]' : 'text-white/70 hover:text-white'
                  }`}>
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="relative p-5 flex flex-col gap-3 min-h-[160px]">
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 rounded-b-[32px]"><Loader /></div>
            )}
            {error && (
              <div className="px-4 py-2 rounded-2xl bg-danger-200/20 border border-danger-200 text-sm text-danger-700">{error}</div>
            )}
            {!loading && total === 0 && !error ? (
              <div className="flex flex-col items-center justify-center gap-2 text-slate-400 py-16">
                <FiCalendar className="w-9 h-9 text-slate-200" />
                <p className="text-sm font-medium">No hay programaciones en este periodo</p>
              </div>
            ) : (
              <div className={`flex flex-col gap-3 transition-opacity ${loading ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                {visibleGroups.map((status, index) => (
                  <ScheduleStatusAccordion
                    key={status}
                    meta={STATUS[status]}
                    rows={rowsFor(status)}
                    showDate={range.dayCount > 1}
                    defaultOpen={index === 0}
                    onOpenRevision={openRevision}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const ContextChip: React.FC<{ icon: IconType; label: string; highlighted?: boolean }> = ({
  icon: Icon,
  label,
  highlighted,
}) => (
  <span
    className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold ${
      highlighted ? 'bg-primary-gold/15 text-primary-gold' : 'bg-slate-100 text-slate-600'
    }`}
  >
    <Icon className="w-3.5 h-3.5" />
    {label}
  </span>
);

export default ChecklistDashboard;
