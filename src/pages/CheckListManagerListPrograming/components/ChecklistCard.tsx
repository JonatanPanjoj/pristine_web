import React from 'react';
import { motion } from 'framer-motion';
import {
  FiEdit2, FiTrash2, FiHelpCircle, FiCalendar,
  FiCamera, FiFileText, FiTag,
} from 'react-icons/fi';
import { Checklist } from '../../../models/Checklist';
import { EnrichedSchedule } from '../hooks/useChecklistsSchedules';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ChecklistCardProps {
  checklists: Checklist[];
  categories: { id: string; name: string }[];
  schedulesMap?: Record<string, EnrichedSchedule[]>;
  loading?: boolean;
  onEdit:   (checklist: Checklist) => void;
  onDelete: (id: string) => void;
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getCategoryName = (cl: Checklist, cats: { id: string; name: string }[]) =>
  cl.categoryName || cats.find(c => c.id === cl.categoryId)?.name || 'Sin categoría';

const formatDate = (iso?: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
    .toString().padStart(2, '0')}/${d.getFullYear()}`;
};

// ─── Flag pill ────────────────────────────────────────────────────────────────

const FlagPill: React.FC<{ icon: React.ReactNode; label: string; active: boolean }> = ({ icon, label, active }) => (
  <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
    active
      ? 'bg-primary-gold/10 border-primary-gold/30 text-primary-gold'
      : 'bg-white border-neutral-200 text-neutral-400'
  }`}>
    {icon}
    {active ? `Requiere ${label}` : `Sin ${label}`}
  </span>
);

// ─── Single card ─────────────────────────────────────────────────────────────

const Card: React.FC<{
  cl: Checklist;
  categoryName: string;
  schedules: EnrichedSchedule[];
  onEdit: (cl: Checklist) => void;
  onDelete: (id: string) => void;
}> = ({ cl, categoryName, schedules, onEdit, onDelete }) => {
  const isActive = cl.isEnabled;
  const questionCount = cl.questions?.length ?? 0;
  const hasQuestions = questionCount > 0;
  const scheduleCount = schedules.length;

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -3 }}
      className="bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] border-0 flex flex-col overflow-hidden w-full max-w-sm"
    >
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <span
          className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full ${
            isActive
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
              : 'bg-rose-50 text-rose-600 border border-rose-200/60'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
              isActive ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
          />
          {isActive ? 'Activo' : 'Inactivo'}
        </span>

        <span
          className={`inline-flex items-center gap-1 text-[10px] font-bold px-3 py-1 rounded-full ${
            hasQuestions
              ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
              : 'bg-slate-100 text-slate-500 border border-slate-200/60'
          }`}
        >
          <FiHelpCircle size={10} />
          {hasQuestions
            ? `${questionCount} ${questionCount === 1 ? 'pregunta' : 'preguntas'}`
            : 'Sin preguntas'}
        </span>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col gap-3 px-6 pb-4 flex-1">
        <h3 className="text-base font-bold text-slate-800 leading-snug line-clamp-2">
          {cl.name}
        </h3>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs text-primary-gold font-bold">
            <FiTag size={11} className="shrink-0" />
            <span className="line-clamp-1">{categoryName}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <FiCalendar size={11} className="shrink-0" />
            <span>Actualizado: {formatDate(cl.updatedAt || (cl as any).updated_at || cl.createdAt || (cl as any).created_at)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <FlagPill icon={<FiCamera size={10} />} label="foto" active={cl.needPhoto} />
          <FlagPill icon={<FiFileText size={10} />} label="firma" active={cl.needFirm} />
        </div>

        {/* ── Desglose de Horarios / Schedules ── */}
        <div className="pt-2.5 border-t border-slate-100">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-2">
            <span className="flex items-center gap-1.5">
              <FiCalendar size={12} className="text-primary-gold" />
              Horarios ({scheduleCount})
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                scheduleCount > 0
                  ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {scheduleCount > 0 ? `${scheduleCount} configurado${scheduleCount !== 1 ? 's' : ''}` : 'Sin horarios'}
            </span>
          </div>

          {scheduleCount === 0 ? (
            <p className="text-[11px] text-slate-400 italic bg-slate-50/80 rounded-2xl px-3 py-2 border border-slate-100/60">
              No tiene horarios de ejecución configurados.
            </p>
          ) : (
            <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1 scrollbar-thin">
              {schedules.map((sch) => (
                <div
                  key={sch.id}
                  className="bg-slate-50/90 rounded-2xl p-2.5 text-[11px] border border-slate-100 flex flex-col gap-1 transition-all hover:bg-amber-50/30"
                >
                  <div className="font-bold text-slate-800 truncate">
                    {sch.areaName ? sch.areaName : sch.sedeName ? sch.sedeName : 'Horario General'}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                    <span className="text-primary-gold font-bold">{sch.daysSummary}</span>
                    <span className="bg-white px-2 py-0.5 rounded-full border border-slate-200/60 font-mono text-slate-700">
                      {sch.startTime?.substring(0, 5)} – {sch.endTime?.substring(0, 5)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="border-t border-slate-100 mx-6" />

      {/* ── Footer: Acciones unificadas ── */}
      <div className="flex items-center gap-2 px-6 py-4">
        <button
          onClick={() => onEdit(cl)}
          title="Editar checklist, preguntas y horarios"
          className="flex-1 py-2.5 px-4 rounded-xl bg-primary-gold text-white text-xs font-bold flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(221,152,3,0.2)] hover:opacity-95 active:scale-95 transition-all"
        >
          <FiEdit2 size={13} />
          Editar
        </button>

        <button
          onClick={() => onDelete(cl.id)}
          title="Eliminar checklist"
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white transition-all active:scale-95 flex-shrink-0"
        >
          <FiTrash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Skeleton: React.FC = () => (
  <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6 flex flex-col gap-4 animate-pulse w-full max-w-sm">
    <div className="flex items-center justify-between">
      <div className="h-5 w-20 bg-neutral-200 rounded-full" />
      <div className="h-5 w-16 bg-neutral-200 rounded-full" />
    </div>
    <div className="h-4 bg-neutral-200 rounded w-3/4" />
    <div className="space-y-1.5">
      <div className="h-3 bg-neutral-200 rounded w-2/3" />
      <div className="h-3 bg-neutral-200 rounded w-1/2" />
    </div>
    <div className="flex gap-1.5">
      <div className="h-5 w-20 bg-neutral-200 rounded-full" />
      <div className="h-5 w-16 bg-neutral-200 rounded-full" />
    </div>
    <div className="border-t border-neutral-100 pt-3 flex gap-2">
      <div className="h-9 flex-1 bg-neutral-200 rounded-xl" />
      <div className="h-9 w-9 bg-neutral-200 rounded-xl" />
    </div>
  </div>
);

// ─── Empty ────────────────────────────────────────────────────────────────────

const Empty: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-20 text-neutral-400 gap-2">
    <FiHelpCircle size={36} className="text-neutral-200" />
    <p className="text-sm font-medium">No se encontraron checklists</p>
    <p className="text-xs text-neutral-300">Intenta con otro término de búsqueda</p>
  </div>
);

// ─── Grid ─────────────────────────────────────────────────────────────────────

const GRID_CLASS = 'w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center';

const ChecklistCard: React.FC<ChecklistCardProps> = ({
  checklists, categories, schedulesMap, loading, onEdit, onDelete,
}) => {
  if (loading) {
    return (
      <div className={GRID_CLASS}>
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}
      </div>
    );
  }

  if (!checklists || checklists.length === 0) return <Empty />;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className={GRID_CLASS}>
      {checklists.map((cl) => (
        <Card
          key={cl.id}
          cl={cl}
          categoryName={getCategoryName(cl, categories)}
          schedules={schedulesMap?.[cl.id] ?? []}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </motion.div>
  );
};

export default ChecklistCard;
