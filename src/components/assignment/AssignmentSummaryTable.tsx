// components/assignment/AssignmentSummaryTable.tsx
// Paso 3: resumen de lo que se va a grabar, por usuario. Cada celda lista los
// nombres; a partir de NAMES_PREVIEW se recorta con «…» y se despliega bajo
// demanda, para que un usuario con cientos de asignaciones no reviente la fila.

import React, { useState } from 'react';
import { FiUser, FiUsers, FiTrash2 } from 'react-icons/fi';
import { AssignUser, AssignTarget } from './assignmentTypes';

const PAGE_SIZE = 5;
const NAMES_PREVIEW = 10; // nombres visibles antes de recortar con «…»

interface AssignmentSummaryTableProps {
  users: AssignUser[];
  targets: AssignTarget[];
  assignIds: Set<string>;
  unassignIds: Set<string>;
  targetNounPlural: string;
  onRemoveUser: (userId: string) => void;
}

export const AssignmentSummaryTable: React.FC<AssignmentSummaryTableProps> = ({
  users,
  targets,
  assignIds,
  unassignIds,
  targetNounPlural,
  onRemoveUser,
}) => {
  const [page, setPage] = useState(1);
  // Celdas desplegadas, identificadas por "userId::columna".
  const [expandedCells, setExpandedCells] = useState<Set<string>>(new Set());

  const toggleCell = (cellKey: string) =>
    setExpandedCells((prev) => {
      const next = new Set(prev);
      next.has(cellKey) ? next.delete(cellKey) : next.add(cellKey);
      return next;
    });

  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = users.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const nameOf = (targetId: string) => targets.find((t) => t.id === targetId)?.name ?? targetId;
  const isAssigned = (targetId: string, userId: string) =>
    targets.find((t) => t.id === targetId)?.assignedUserIds.includes(userId) ?? false;

  const th = 'py-2.5 px-4 bg-primary-gold text-white text-xs font-bold uppercase tracking-wider whitespace-nowrap';
  const cell = 'py-2.5 px-4 bg-[#FAFAFA] align-middle group-hover:bg-slate-50/80 transition-colors';

  return (
    <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6 md:p-8">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-8 h-8 rounded-full bg-primary-gold text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
          3
        </span>
        <div>
          <h2 className="text-base font-bold text-slate-800">Resumen de cambios por usuario</h2>
          <p className="text-xs text-slate-500 mt-0.5">Esto es exactamente lo que se grabará al pulsar “Grabar cambios”.</p>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-slate-400">
          <FiUsers className="w-10 h-10 text-slate-300" />
          <p className="text-sm font-medium">Selecciona usuarios para ver el resumen</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto min-h-0 scrollbar-none">
            <table className="w-full border-separate border-spacing-y-3 border-spacing-x-0 text-left">
              <thead>
                <tr>
                  <th className={`${th} first:rounded-l-full`}>Usuario</th>
                  <th className={th}>Actuales</th>
                  <th className={th}>Se asignarán</th>
                  <th className={th}>Se quitarán</th>
                  <th className={th}>Resultado final</th>
                  <th className={`${th} text-center last:rounded-r-full`}>Quitar</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((user) => {
                  const currentNames = targets
                    .filter((t) => t.assignedUserIds.includes(user.id))
                    .map((t) => t.name);
                  const currentCount = currentNames.length;
                  const adds = [...assignIds].filter((id) => !isAssigned(id, user.id));
                  const removes = [...unassignIds].filter((id) => isAssigned(id, user.id));
                  const finalCount = currentCount + adds.length - removes.length;

                  return (
                    <tr key={user.id} className="hover:shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-shadow group">
                      <td className={`${cell} first:rounded-l-full`}>
                        <div className="flex items-center gap-2.5 min-w-[160px]">
                          <span className="w-8 h-8 rounded-full bg-primary-gold/15 text-primary-gold flex items-center justify-center shrink-0">
                            <FiUser className="w-4 h-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                            {user.email && <p className="text-xs font-normal text-slate-400 truncate">{user.email}</p>}
                          </div>
                        </div>
                      </td>

                      <td className={cell}>
                        <NameList
                          names={currentNames}
                          tone="neutral"
                          countLabel={`${currentCount} ${targetNounPlural}`}
                          expanded={expandedCells.has(`${user.id}::current`)}
                          onToggle={() => toggleCell(`${user.id}::current`)}
                        />
                      </td>

                      <td className={cell}>
                        <NameList
                          names={adds.map(nameOf)}
                          tone="success"
                          countLabel={`+${adds.length}`}
                          expanded={expandedCells.has(`${user.id}::adds`)}
                          onToggle={() => toggleCell(`${user.id}::adds`)}
                        />
                      </td>

                      <td className={cell}>
                        <NameList
                          names={removes.map(nameOf)}
                          tone="danger"
                          countLabel={`−${removes.length}`}
                          expanded={expandedCells.has(`${user.id}::removes`)}
                          onToggle={() => toggleCell(`${user.id}::removes`)}
                        />
                      </td>

                      <td className={cell}>
                        <div className="flex items-baseline gap-1.5 whitespace-nowrap">
                          <span className="text-sm font-extrabold text-slate-800 tabular-nums">{finalCount}</span>
                          <span className="text-xs text-slate-400">{targetNounPlural}</span>
                          {finalCount !== currentCount && (
                            <span
                              className={`text-xs font-bold ${
                                finalCount > currentCount ? 'text-emerald-600' : 'text-rose-600'
                              }`}
                            >
                              ({finalCount > currentCount ? '+' : ''}
                              {finalCount - currentCount})
                            </span>
                          )}
                        </div>
                      </td>

                      <td className={`${cell} last:rounded-r-full text-center`}>
                        <button
                          onClick={() => onRemoveUser(user.id)}
                          title="Quitar usuario del lote"
                          className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 border border-rose-200/60 hover:bg-rose-100 flex items-center justify-center mx-auto active:scale-95 transition-all shadow-sm"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-500">
                {users.length} usuario{users.length !== 1 ? 's' : ''} en el lote
              </span>
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
          )}
        </>
      )}
    </div>
  );
};

/* ── Lista de nombres con recorte «…» ─────────────────────────────────────── */
type NameTone = 'neutral' | 'success' | 'danger';

const CHIP_CLASSES: Record<NameTone, string> = {
  neutral: 'bg-slate-100 text-slate-600 border-slate-200/60',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  danger: 'bg-rose-50 text-rose-700 border-rose-200/60',
};

const COUNT_CLASSES: Record<NameTone, string> = {
  neutral: 'text-slate-700',
  success: 'text-emerald-600',
  danger: 'text-rose-600',
};

interface NameListProps {
  names: string[];
  tone: NameTone;
  countLabel: string;
  expanded: boolean;
  onToggle: () => void;
}

const NameList: React.FC<NameListProps> = ({ names, tone, countLabel, expanded, onToggle }) => {
  if (names.length === 0) return <span className="text-xs text-slate-400 font-normal italic">—</span>;

  const isTruncated = names.length > NAMES_PREVIEW;
  const visible = expanded || !isTruncated ? names : names.slice(0, NAMES_PREVIEW);

  return (
    <div className="min-w-[180px] max-w-[280px]">
      <span className={`text-sm font-extrabold tabular-nums ${COUNT_CLASSES[tone]}`}>{countLabel}</span>

      <div className={`flex flex-wrap items-center gap-1 mt-1 ${expanded ? 'max-h-40 overflow-y-auto pr-1 scrollbar-none' : ''}`}>
        {visible.map((name, index) => (
          <span
            key={`${name}-${index}`}
            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium border ${CHIP_CLASSES[tone]}`}
            title={name}
          >
            {name}
          </span>
        ))}

        {isTruncated && (
          <button
            type="button"
            onClick={onToggle}
            title={expanded ? 'Mostrar menos' : `Ver las ${names.length}`}
            className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border border-slate-300 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            {expanded ? 'Ver menos' : `… +${names.length - NAMES_PREVIEW}`}
          </button>
        )}
      </div>
    </div>
  );
};

export default AssignmentSummaryTable;
