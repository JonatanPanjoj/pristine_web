// src/pages/Revisions&Results/components/ScheduleTable.tsx
import React, { useState } from 'react';
import { useActiveSchedules } from '../hooks/useActiveSchedules';
import { useCreateRevision } from '../hooks/useCreateRevision';
import { useGetRevisionById } from '../hooks/useGetRevisionById';
import { ActiveScheduleResult } from '../adapters/getActiveSchedulesAdapter';
import { ChecklistRevision } from '../../../models/ChecklistRevision';
import FormModal from '../../../components/FormModal';
import { ExitoCard } from '../../../components/ExitoCard';
import RevisionForm from './RevisionForm';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import useEnabledSedesForUser from '../../../components/sedesEnabled/hooks/useEnabledSedesForUser';
import { FiPlay, FiRefreshCw, FiClock, FiClipboard } from 'react-icons/fi';

interface ScheduleTableProps {
  searchParams: {
    areaId?: number | null;
    sectorId?: string | null;
    sedeId?: string | null;
    categoryId?: string | null;
  };
}

const COL_HEADERS = ['Código', 'Checklist', 'Categoría', 'Horario', 'Estado', 'Acciones'];

const TimeRangeBadge: React.FC<{ start: string; end: string; inRange: boolean }> = ({ start, end, inRange }) => (
  <div className="flex flex-col items-center gap-0.5">
    <div className="flex items-center gap-1">
      <FiClock className={`w-3.5 h-3.5 ${inRange ? 'text-emerald-600' : 'text-slate-400'}`} />
      <span className={`text-xs font-semibold ${inRange ? 'text-emerald-700' : 'text-slate-500'}`}>
        {start} – {end}
      </span>
    </div>
    {inRange && <span className="text-[10px] text-emerald-600 font-bold">En horario</span>}
  </div>
);

const CategoryBadge: React.FC<{ label: string }> = ({ label }) => (
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 whitespace-nowrap">
    {label}
  </span>
);

const CodeBadge: React.FC<{ code: number }> = ({ code }) => (
  <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200/60">
    {code.toString().padStart(4, '0')}
  </span>
);

const ActionBtn: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}> = ({ icon, label, onClick, disabled, variant = 'secondary' }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center gap-1.5 rounded-full px-5 py-1.5 text-xs font-bold transition-all active:scale-95 focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed ${
      variant === 'primary'
        ? 'bg-primary-gold text-white shadow-[0_4px_12px_rgba(252,181,33,0.25)] hover:opacity-90'
        : 'bg-primary-dark text-white hover:opacity-90 shadow-sm'
    }`}
  >
    {icon}{label}
  </button>
);

const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center gap-2 text-slate-400 py-20 min-h-[320px]">
    <FiClipboard className="w-8 h-8 text-slate-300 mx-auto mb-2" />
    <p className="text-sm font-medium">No hay programaciones activas</p>
    <p className="text-xs text-slate-400">Ajusta los filtros de búsqueda</p>
  </div>
);

function isTimeInRange(startTime: string, endTime: string): boolean {
  const now = new Date();
  const [sH, sM] = startTime.split(':').map(Number);
  const [eH, eM] = endTime.split(':').map(Number);
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), sH, sM);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), eH, eM);
  return now >= start && now <= end;
}

const ScheduleTable: React.FC<ScheduleTableProps> = ({ searchParams }) => {
  const [selectedRevision, setSelectedRevision] = useState<ChecklistRevision | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<ActiveScheduleResult | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [fetchLoading, setFetchLoading] = useState(false);

  const { data, loading, error, reload } = useActiveSchedules();
  const { createRevision, loading: createLoading } = useCreateRevision();
  const { getRevisionById } = useGetRevisionById();
  const user = useSelector((state: RootState) => state.user.user);

  const { sedes } = useEnabledSedesForUser();
  const userSedeIds = new Set(sedes.map((s) => s.id));
  const isAdmin = user?.rol === 'admin' || user?.rol_name?.toLowerCase().includes('admin') || user?.user === 'admin';

  const filtered = (data ?? []).filter((s) => {
    if (!isAdmin && userSedeIds.size && !userSedeIds.has(s.sedeId)) return false;
    if (searchParams.sedeId && s.sedeId !== searchParams.sedeId) return false;
    if (searchParams.sectorId && s.sectorId !== searchParams.sectorId) return false;
    if (searchParams.areaId != null && s.areaId !== searchParams.areaId) return false;
    if (searchParams.categoryId && s.categoryId !== searchParams.categoryId) return false;
    return true;
  });

  const handleCreateRevision = async (schedule: ActiveScheduleResult) => {
    if (!isTimeInRange(schedule.startTime, schedule.endTime)) {
      alert('La hora actual no está dentro del rango permitido.');
      return;
    }
    try {
      const revision = await createRevision({
        scheduleId: schedule.scheduleId,
        checklistId: schedule.checklistId,
        sedeId: schedule.sedeId,
        sedeName: schedule.sedeName,
        sectorId: schedule.sectorId,
        sectorName: schedule.sectorName,
        areaId: schedule.areaId,
        areaName: schedule.areaName,
        userId: user?.id ?? '',
        userName: user?.name ?? '',
      });
      setSelectedRevision(revision);
      setSelectedSchedule(schedule);
      setSuccessMessage('Revisión creada exitosamente.');
      setShowSuccessCard(true);
      setModalOpen(true);
    } catch {
      alert('Ocurrió un error al crear la revisión.');
    }
  };

  const handleOpenRevision = async (schedule: ActiveScheduleResult) => {
    if (!schedule.revisionId) {
      alert('No hay una revisión activa asociada.');
      return;
    }
    setFetchLoading(true);
    try {
      const revision = await getRevisionById(schedule.revisionId);
      if (!revision) {
        alert('No se encontró la revisión.');
        return;
      }
      setSelectedRevision(revision);
      setSelectedSchedule(schedule);
      setModalOpen(true);
    } catch {
      alert('Ocurrió un error al cargar la revisión.');
    } finally {
      setFetchLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    reload();
  };

  return (
    <div className="relative bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6 md:p-8 flex flex-col flex-1 min-h-0 select-none border-0">
      {error && (
        <div className="mb-4 px-4 py-2 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600 font-medium">
          {error}
        </div>
      )}

      {/* Estructura Pildórica de la Tabla */}
      <div className="flex-1 overflow-auto min-h-0 scrollbar-none">
        <table className="w-full border-separate border-spacing-y-4 text-center">
          <thead>
            <tr className="text-white text-xs font-bold uppercase tracking-wider">
              {COL_HEADERS.map((h) => (
                <th
                  key={h}
                  className="py-2 px-4 bg-primary-gold first:rounded-l-full last:rounded-r-full"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading || createLoading || fetchLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td
                      key={j}
                      className="py-2 px-4 bg-[#FAFAFA] first:rounded-l-full last:rounded-r-full"
                    >
                      <div className="h-4 bg-neutral-200 rounded w-16 mx-auto"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12">
                  <EmptyState />
                </td>
              </tr>
            ) : (
              filtered.map((row) => {
                const inRange = isTimeInRange(row.startTime, row.endTime);
                return (
                  <tr
                    key={row.scheduleId}
                    className="hover:shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-shadow group"
                  >
                    <td className="py-2 px-4 bg-[#FAFAFA] first:rounded-l-full last:rounded-r-full">
                      {row.revisionCode ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-primary-gold/15 text-primary-dark border border-primary-gold/40">
                          {row.revisionCode}
                        </span>
                      ) : (
                        <CodeBadge code={row.areaId} />
                      )}
                    </td>
                    {/* Checklist Name (Key Field) */}
                    <td className="py-2 px-4 bg-[#FAFAFA] text-slate-800 text-sm font-bold first:rounded-l-full last:rounded-r-full">
                      <span className="truncate max-w-[200px] inline-block">{row.checklistName}</span>
                    </td>
                    <td className="py-2 px-4 bg-[#FAFAFA] first:rounded-l-full last:rounded-r-full">
                      <CategoryBadge label={row.categoryName || '—'} />
                    </td>
                    <td className="py-2 px-4 bg-[#FAFAFA] first:rounded-l-full last:rounded-r-full">
                      <TimeRangeBadge start={row.startTime} end={row.endTime} inRange={inRange} />
                    </td>
                    <td className="py-2 px-4 bg-[#FAFAFA] first:rounded-l-full last:rounded-r-full">
                      {row.revisionId ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          row.revisionStatus === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : row.revisionStatus === 'in_progress'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {row.revisionStatus === 'completed' ? 'Completada' : row.revisionStatus === 'in_progress' ? 'En progreso' : 'Pendiente'}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Sin iniciar</span>
                      )}
                    </td>
                    <td className="py-2 px-4 bg-[#FAFAFA] first:rounded-l-full last:rounded-r-full">
                      {row.revisionId ? (
                        <ActionBtn
                          icon={<FiRefreshCw className="w-3.5 h-3.5" />}
                          label={row.revisionStatus === 'completed' ? 'Ver revisión' : 'Continuar revisión'}
                          onClick={() => handleOpenRevision(row)}
                          variant="secondary"
                        />
                      ) : (
                        <ActionBtn
                          icon={<FiPlay className="w-3.5 h-3.5" />}
                          label="Nueva revisión"
                          onClick={() => handleCreateRevision(row)}
                          variant="primary"
                        />
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex items-center justify-between flex-shrink-0 flex-wrap gap-4 pt-4 border-t border-slate-100">
        <span className="text-sm font-semibold text-slate-500">{filtered.length} programaciones</span>
      </div>

      {showSuccessCard && (
        <ExitoCard
          onClose={() => setShowSuccessCard(false)}
          success
          message={successMessage}
          loading={loading || createLoading || fetchLoading}
        />
      )}

      {/* Modal de revisión */}
      {isModalOpen && selectedRevision && selectedSchedule && (
        <FormModal
          isOpen={isModalOpen}
          onClose={closeModal}
          maxWidth="max-w-4xl"
        >
          <RevisionForm
            revision={selectedRevision}
            schedule={selectedSchedule}
            onSave={() => {
              setModalOpen(false);
              setSuccessMessage('Revisión actualizada exitosamente.');
              setShowSuccessCard(true);
              reload();
            }}
            onCancel={closeModal}
          />
        </FormModal>
      )}
    </div>
  );
};

export default ScheduleTable;
