// components/assignment/AssignmentUserPicker.tsx
// Paso 1: elegir a quién se le van a gestionar las asignaciones. Buscador +
// lista paginada; los elegidos quedan como chips retirables.

import React, { useMemo, useState } from 'react';
import { FiSearch, FiUser, FiX } from 'react-icons/fi';
import { AssignUser } from './assignmentTypes';

const PAGE_SIZE = 5;

interface AssignmentUserPickerProps {
  users: AssignUser[];
  selectedIds: Set<string>;
  loading?: boolean;
  onToggle: (userId: string) => void;
  onClear: () => void;
}

export const AssignmentUserPicker: React.FC<AssignmentUserPickerProps> = ({
  users,
  selectedIds,
  loading,
  onToggle,
  onClear,
}) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.name.toLowerCase().includes(q) || (u.email ?? '').toLowerCase().includes(q));
  }, [users, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const selectedUsers = users.filter((u) => selectedIds.has(u.id));

  return (
    <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6 md:p-8 flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-8 h-8 rounded-full bg-primary-gold text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
          1
        </span>
        <div>
          <h2 className="text-base font-bold text-slate-800">Selecciona usuarios</h2>
          <p className="text-xs text-slate-500 mt-0.5">Sus asignaciones se gestionan en el panel de la derecha</p>
        </div>
      </div>

      <div className="relative mb-3">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Buscar usuario por nombre o correo..."
          className="w-full bg-slate-100/80 border-0 rounded-full pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 font-semibold focus:outline-none focus:ring-2 focus:ring-primary-gold/40 transition-all"
        />
      </div>

      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-3 pb-3 border-b border-slate-100">
          {selectedUsers.map((u) => (
            <button
              key={u.id}
              onClick={() => onToggle(u.id)}
              title="Quitar del lote"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-gold/15 text-primary-gold text-xs font-bold hover:bg-primary-gold/25 transition-all"
            >
              {u.name}
              <FiX className="w-3 h-3" />
            </button>
          ))}
          <button onClick={onClear} className="ml-auto text-xs font-semibold text-slate-400 hover:text-primary-gold transition-colors">
            Limpiar
          </button>
        </div>
      )}

      <div className="space-y-2 min-h-[280px]">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-9 h-9 bg-slate-200 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/2" />
                <div className="h-3 bg-slate-200 rounded w-1/3" />
              </div>
            </div>
          ))
        ) : paged.length === 0 ? (
          <div className="flex items-center justify-center h-[280px] text-slate-400 text-sm font-medium">
            Sin resultados
          </div>
        ) : (
          paged.map((u) => {
            const selected = selectedIds.has(u.id);
            return (
              <button
                key={u.id}
                type="button"
                onClick={() => onToggle(u.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${
                  selected
                    ? 'border-primary-gold/40 bg-amber-50/40 shadow-sm'
                    : 'border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-white'
                }`}
              >
                <input type="checkbox" checked={selected} readOnly className="w-4 h-4 rounded accent-primary-gold pointer-events-none shrink-0" />
                <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${selected ? 'bg-primary-gold text-white shadow-sm' : 'bg-primary-gold/15 text-primary-gold'}`}>
                  <FiUser className="w-4 h-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-800 truncate">{u.name}</p>
                  {u.email && <p className="text-xs text-slate-500 font-normal truncate mt-0.5">{u.email}</p>}
                </div>
              </button>
            );
          })
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <span className="text-xs font-semibold text-slate-500">
          {filtered.length} usuario{filtered.length !== 1 ? 's' : ''}
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
    </div>
  );
};

export default AssignmentUserPicker;
