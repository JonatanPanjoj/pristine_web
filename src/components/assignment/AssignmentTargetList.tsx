// components/assignment/AssignmentTargetList.tsx
// Paso 2: una sola lista con TODOS los destinos. Se busca, se filtra por estado
// y se asigna o quita en la propia fila. Pensado para usuarios con cientos de
// asignaciones: no hay que salir de aquí para nada.

import React, { useMemo, useState } from 'react';
import { FiSearch, FiMapPin, FiCheck, FiX, FiPlus } from 'react-icons/fi';
import { AssignTarget, AssignmentState, AssignmentFilter } from './assignmentTypes';

const PAGE_SIZE_OPTIONS = [10, 25, 50];

interface TargetRow {
  target: AssignTarget;
  state: AssignmentState;
  changed: boolean;
  assignedCount: number;
}

interface AssignmentTargetListProps {
  targetsTitle: string;
  targetNounSingular: string;
  targetNounPlural: string;
  targets: AssignTarget[];
  selectedUserIds: string[];
  assignIds: Set<string>;
  unassignIds: Set<string>;
  icon?: React.ReactNode;
  loading?: boolean;
  onToggleTarget: (targetId: string) => void;
  onSetMany: (targetIds: string[], assign: boolean) => void;
}

export const AssignmentTargetList: React.FC<AssignmentTargetListProps> = ({
  targetsTitle,
  targetNounSingular,
  targetNounPlural,
  targets,
  selectedUserIds,
  assignIds,
  unassignIds,
  icon,
  loading,
  onToggleTarget,
  onSetMany,
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<AssignmentFilter>('all');
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [page, setPage] = useState(1);

  const hasUsers = selectedUserIds.length > 0;

  // Estado efectivo de cada destino = asignación actual + cambios pendientes.
  const rows = useMemo<TargetRow[]>(
    () =>
      targets.map((target) => {
        const assignedCount = selectedUserIds.filter((id) => target.assignedUserIds.includes(id)).length;
        let state: AssignmentState =
          assignedCount === 0 ? 'none' : assignedCount === selectedUserIds.length ? 'all' : 'some';
        if (assignIds.has(target.id)) state = 'all';
        if (unassignIds.has(target.id)) state = 'none';
        return { target, state, changed: assignIds.has(target.id) || unassignIds.has(target.id), assignedCount };
      }),
    [targets, selectedUserIds, assignIds, unassignIds]
  );

  const searched = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) => r.target.name.toLowerCase().includes(q) || (r.target.subtitle ?? '').toLowerCase().includes(q)
    );
  }, [rows, search]);

  const counts = useMemo(
    () => ({
      all: searched.length,
      assigned: searched.filter((r) => r.state !== 'none').length,
      unassigned: searched.filter((r) => r.state === 'none').length,
    }),
    [searched]
  );

  const filtered = useMemo(() => {
    if (filter === 'assigned') return searched.filter((r) => r.state !== 'none');
    if (filter === 'unassigned') return searched.filter((r) => r.state === 'none');
    return searched;
  }, [searched, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const filteredIds = filtered.map((r) => r.target.id);

  const resetPage = () => setPage(1);

  return (
    <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6 md:p-8 flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-8 h-8 rounded-full bg-primary-gold text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
          2
        </span>
        <div>
          <h2 className="text-base font-bold text-slate-800">{targetsTitle}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Busca y pulsa para asignar o quitar. Los cambios se guardan al final.
          </p>
        </div>
      </div>

      <div className="relative mb-3">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            resetPage();
          }}
          placeholder={`Buscar entre ${targets.length} ${targetNounPlural}...`}
          className="w-full bg-slate-100/80 border-0 rounded-full pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 font-semibold focus:outline-none focus:ring-2 focus:ring-primary-gold/40 transition-all"
        />
      </div>

      {/* Filtro segmentado */}
      <div className="bg-slate-100 p-1 rounded-full flex gap-1 mb-3">
        <FilterTab label="Todas" count={counts.all} active={filter === 'all'} onClick={() => { setFilter('all'); resetPage(); }} />
        <FilterTab label="Asignadas" count={counts.assigned} active={filter === 'assigned'} onClick={() => { setFilter('assigned'); resetPage(); }} />
        <FilterTab label="Sin asignar" count={counts.unassigned} active={filter === 'unassigned'} onClick={() => { setFilter('unassigned'); resetPage(); }} />
      </div>

      {/* Acciones en lote sobre lo filtrado */}
      {hasUsers && filteredIds.length > 0 && (
        <div className="flex items-center justify-between gap-2 mb-3 px-1 flex-wrap">
          <span className="text-xs font-bold text-slate-700">
            {filtered.length} en pantalla
          </span>
          <div className="flex items-center gap-2">
            {filter !== 'assigned' && (
              <button
                onClick={() => onSetMany(filteredIds, true)}
                className="text-xs font-bold px-3 py-1.5 rounded-full bg-primary-gold/15 text-primary-gold hover:bg-primary-gold/25 transition-all active:scale-95"
              >
                Asignar {filtered.length}
              </button>
            )}
            {filter !== 'unassigned' && (
              <button
                onClick={() => onSetMany(filteredIds, false)}
                className="text-xs font-bold px-3 py-1.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200/60 hover:bg-rose-100 transition-all active:scale-95"
              >
                Quitar {filtered.length}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Lista */}
      <div className="space-y-2 min-h-[360px]">
        {!hasUsers ? (
          <div className="flex flex-col items-center justify-center h-[360px] text-slate-400 gap-1">
            <p className="text-sm font-medium">Selecciona primero uno o más usuarios</p>
            <p className="text-xs">Aquí verás sus {targetNounPlural} y podrás asignarlas o quitarlas</p>
          </div>
        ) : loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-9 h-9 bg-slate-200 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/2" />
                <div className="h-3 bg-slate-200 rounded w-1/3" />
              </div>
            </div>
          ))
        ) : paged.length === 0 ? (
          <div className="flex items-center justify-center h-[360px] text-slate-400 text-sm font-medium">
            Sin resultados
          </div>
        ) : (
          paged.map((row) => (
            <TargetRowItem
              key={row.target.id}
              row={row}
              icon={icon}
              totalUsers={selectedUserIds.length}
              targetNounSingular={targetNounSingular}
              onToggle={() => onToggleTarget(row.target.id)}
            />
          ))
        )}
      </div>

      {/* Paginación + tamaño de página */}
      <div className="mt-4 flex items-center justify-between gap-3 pt-3 border-t border-slate-100 flex-wrap">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span>Mostrar</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              resetPage();
            }}
            className="bg-slate-100 border-0 rounded-full px-3 py-1 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={safePage <= 1}
            onClick={() => setPage(safePage - 1)}
            className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            Anterior
          </button>
          <span className="text-xs font-semibold text-slate-500 tabular-nums">
            {safePage}/{totalPages}
          </span>
          <button
            disabled={safePage >= totalPages}
            onClick={() => setPage(safePage + 1)}
            className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Pestaña de filtro ────────────────────────────────────────────────────── */
const FilterTab: React.FC<{ label: string; count: number; active: boolean; onClick: () => void }> = ({
  label,
  count,
  active,
  onClick,
}) => (
  <button
    onClick={onClick}
    className={`flex-1 rounded-full px-3 py-2 text-xs font-bold transition-all ${
      active ? 'bg-white text-primary-gold shadow-sm' : 'text-slate-500 hover:text-slate-700 bg-transparent'
    }`}
  >
    {label} <span className="tabular-nums opacity-70">({count})</span>
  </button>
);

/* ── Fila de destino ──────────────────────────────────────────────────────── */
const TargetRowItem: React.FC<{
  row: TargetRow;
  icon?: React.ReactNode;
  totalUsers: number;
  targetNounSingular: string;
  onToggle: () => void;
}> = ({ row, icon, totalUsers, targetNounSingular, onToggle }) => {
  const { target, state, changed, assignedCount } = row;
  const isAssigned = state !== 'none';

  return (
    <div
      className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all ${
        changed
          ? state === 'none'
            ? 'border-rose-200 bg-rose-50/50'
            : 'border-emerald-200 bg-emerald-50/40'
          : 'border-slate-100 bg-slate-50/50'
      }`}
    >
      <span
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
          isAssigned ? 'bg-primary-gold text-white shadow-sm' : 'bg-slate-200/70 text-slate-400'
        }`}
      >
        {icon ?? <FiMapPin className="w-4 h-4" />}
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-slate-800 truncate">{target.name}</p>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          {target.subtitle && <span className="text-xs text-slate-500 font-normal truncate">{target.subtitle}</span>}
          {state === 'some' && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60 whitespace-nowrap">
              {assignedCount} de {totalUsers}
            </span>
          )}
          {changed && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                state === 'none' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {state === 'none' ? 'se quitará' : 'se asignará'}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={onToggle}
        title={isAssigned ? `Quitar ${targetNounSingular}` : `Asignar ${targetNounSingular}`}
        className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
          isAssigned
            ? 'bg-rose-50 text-rose-600 border border-rose-200/60 hover:bg-rose-100'
            : 'bg-primary-gold text-white hover:opacity-90 shadow-sm'
        }`}
      >
        {isAssigned ? (
          <><FiX className="w-3.5 h-3.5" /> Quitar</>
        ) : (
          <><FiPlus className="w-3.5 h-3.5" /> Asignar</>
        )}
      </button>

      {isAssigned && !changed && (
        <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center" title="Ya asignada">
          <FiCheck className="w-3.5 h-3.5" />
        </span>
      )}
    </div>
  );
};

export default AssignmentTargetList;
