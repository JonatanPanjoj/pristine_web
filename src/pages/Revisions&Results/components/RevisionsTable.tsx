// src/pages/Revisions&Results/components/RevisionsTable.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useRevisionsTable } from '../hooks/useRevisionsTable';
import { ChecklistRevision, ChecklistRevisionStatus } from '../../../models/ChecklistRevision';
import { Sector } from '../../../models/Sector';
import useMenuLinks from '../../../route/routerLink/useMenuLinks';
import useEnabledSedesForUser from '../../../components/sedesEnabled/hooks/useEnabledSedesForUser';
import { fetchSectorsBySedeIds } from '../../../components/sectorAll/hooks/fetchSectorsBySedeIds';
import { FiEye, FiChevronLeft, FiChevronRight, FiClipboard, FiCalendar } from 'react-icons/fi';

const PAGE_SIZE = 10;

const COL_HEADERS = ['ID Revisión', 'Estado', 'Checklist', 'Categoría', 'Área', 'Sede / Sector', 'Fecha Inicio', 'Acciones'];

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

interface Option {
  value: string;
  label: string;
}

const getStatusStyle = (status: string) => {
  const norm = String(status || '').toLowerCase().trim();

  // Completada / Finalizada / Done -> VERDE
  if (
    norm === 'completed' || norm === 'completada' || norm === 'completado' ||
    norm.includes('complet') || norm.includes('finaliz') || norm.includes('termin') ||
    norm.includes('done') || norm.includes('hecho')
  ) {
    return {
      label: 'Completada',
      cls: 'bg-emerald-50 text-emerald-700 border-emerald-300',
      style: { backgroundColor: '#ECFDF5', color: '#047857', borderColor: '#6EE7B7' },
      dotStyle: { backgroundColor: '#10B981' },
    };
  }

  // Expirada / Vencida / Expired -> ROJO
  if (
    norm === 'expired' || norm === 'expirada' || norm === 'expirado' ||
    norm.includes('expir') || norm.includes('venc') || norm.includes('fall') ||
    norm.includes('cancel') || norm.includes('late')
  ) {
    return {
      label: 'Expirada',
      cls: 'bg-rose-50 text-rose-700 border-rose-300',
      style: { backgroundColor: '#FFF1F2', color: '#BE123C', borderColor: '#FDA4AF' },
      dotStyle: { backgroundColor: '#F43F5E' },
    };
  }

  // Pendiente / Pending -> AMARILLO/ÁMBAR
  if (
    norm === 'pending' || norm === 'pendiente' ||
    norm.includes('pend') || norm.includes('espera') || norm.includes('abiert')
  ) {
    return {
      label: 'Pendiente',
      cls: 'bg-amber-50 text-amber-700 border-amber-300',
      style: { backgroundColor: '#FFFBEB', color: '#B45309', borderColor: '#FCD34D' },
      dotStyle: { backgroundColor: '#F59E0B' },
    };
  }

  // En progreso / In progress -> AZUL
  if (
    norm === 'in_progress' || norm === 'en_progreso' || norm === 'en progreso' ||
    norm.includes('progr') || norm.includes('proces')
  ) {
    return {
      label: 'En progreso',
      cls: 'bg-blue-50 text-blue-700 border-blue-300',
      style: { backgroundColor: '#EFF6FF', color: '#1D4ED8', borderColor: '#93C5FD' },
      dotStyle: { backgroundColor: '#3B82F6' },
    };
  }

  return {
    label: status || 'Desconocido',
    cls: 'bg-slate-100 text-slate-700 border-slate-200',
    style: { backgroundColor: '#F1F5F9', color: '#334155', borderColor: '#CBD5E1' },
    dotStyle: { backgroundColor: '#64748B' },
  };
};

const StatusBadge: React.FC<{ status: ChecklistRevisionStatus | string }> = ({ status }) => {
  const cfg = getStatusStyle(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap ${cfg.cls}`}
      style={cfg.style}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={cfg.dotStyle} />
      {cfg.label}
    </span>
  );
};

const getRevisionChecklistName = (rev: any): string => {
  if (!rev) return '—';
  if (typeof rev.checklist === 'string') return rev.checklist;
  if (rev.checklist && typeof rev.checklist === 'object' && rev.checklist.name) {
    return rev.checklist.name;
  }
  if (rev.checklistName) return rev.checklistName;
  if (rev.checklist_name) return rev.checklist_name;
  if (rev.checklistId) return rev.checklistId;
  return '—';
};

const getRevisionTime = (rev: any): number => {
  if (!rev) return 0;
  const raw =
    rev.endDate ??
    rev.end_date ??
    rev.updatedAt ??
    rev.updated_at ??
    rev.createdAt ??
    rev.created_at ??
    rev.startDate ??
    rev.start_date;
  if (!raw) return 0;
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'string') {
    const parsed = Date.parse(raw);
    return isNaN(parsed) ? 0 : parsed;
  }
  if (typeof raw === 'object') {
    if (typeof raw.toMillis === 'function') return raw.toMillis();
    if (typeof raw.seconds === 'number') return raw.seconds * 1000;
    if (raw instanceof Date) return raw.getTime();
  }
  return 0;
};

const DateInput: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
}> = ({ label, value, onChange }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-slate-700 ml-1">{label}</label>
    <div className="relative">
      <FiCalendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold bg-slate-100/80 border-0 rounded-full text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-gold/40 transition-all cursor-pointer"
      />
    </div>
  </div>
);

const FilterSelect: React.FC<{
  label: string;
  placeholder: string;
  value: string;
  options: Option[];
  onChange: (v: string) => void;
}> = ({ label, placeholder, value, options, onChange }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-slate-700 ml-1">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={options.length === 0}
      className="w-full py-2.5 px-4 text-xs font-semibold bg-slate-100/80 border-0 rounded-full text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-gold/40 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </div>
);

const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center gap-2 text-slate-400 py-20 min-h-[320px]">
    <FiClipboard className="w-8 h-8 text-slate-300 mx-auto mb-2" />
    <p className="text-sm font-medium">No se encontraron revisiones</p>
    <p className="text-xs text-slate-400">Ajusta el rango de fechas o los filtros</p>
  </div>
);

const buildOptions = (
  rows: ChecklistRevision[],
  getValue: (r: ChecklistRevision) => string,
  getLabel: (r: ChecklistRevision) => string,
): Option[] => {
  const map = new Map<string, string>();
  for (const r of rows) {
    const value = getValue(r);
    if (value && !map.has(value)) map.set(value, getLabel(r) || value);
  }
  return Array.from(map, ([value, label]) => ({ value, label })).sort((a, b) =>
    a.label.localeCompare(b.label)
  );
};

const formatDate = (isoString: string | null): string => {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('es-GT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const statusOptions: Option[] = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'in_progress', label: 'En progreso' },
  { value: 'completed', label: 'Completada' },
  { value: 'expired', label: 'Expirada' },
];

const RevisionsTable: React.FC = () => {
  const [startDate, setStartDate] = useState<Date>(new Date(Date.now() - 7 * 86_400_000));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const { getLinkByName } = useMenuLinks();

  const openRevision = (id: string) =>
    window.open(getLinkByName('revisionDetail').replace(':revisionId', id), '_blank', 'noopener');

  const [sedeId, setSedeId] = useState('');
  const [sectorId, setSectorId] = useState('');
  const [areaId, setAreaId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [checklistId, setChecklistId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, loading, error } = useRevisionsTable(startDate, endDate);

  const { sedes } = useEnabledSedesForUser();
  const [sectors, setSectors] = useState<Sector[]>([]);

  useEffect(() => {
    const ids = sedes.map((s) => s.id);
    if (ids.length) fetchSectorsBySedeIds({ sedeIds: ids }).then(setSectors);
    else setSectors([]);
  }, [sedes]);

  const userSedeIds = useMemo(() => {
    const set = new Set<string>();
    sedes.forEach((s: any) => {
      if (s.id) set.add(String(s.id));
      if (s._id) set.add(String(s._id));
      if (s.sede_id) set.add(String(s.sede_id));
    });
    return set;
  }, [sedes]);

  const sedeNameById = useMemo<Record<string, string>>(
    () => {
      const map: Record<string, string> = {};
      sedes.forEach((s: any) => {
        if (s.id) map[s.id] = s.name;
        if (s._id) map[s._id] = s.name;
        if (s.sede_id) map[s.sede_id] = s.name;
      });
      return map;
    },
    [sedes]
  );
  const sectorNameById = useMemo<Record<string, string>>(
    () => {
      const map: Record<string, string> = {};
      sectors.forEach((s: any) => {
        if (s.id) map[s.id] = s.name;
        if (s._id) map[s._id] = s.name;
        if (s.sector_id) map[s.sector_id] = s.name;
      });
      return map;
    },
    [sectors]
  );

  const rows = useMemo(
    () => {
      if (!userSedeIds.size) return data;
      return data.filter((r) => {
        const sId = String(r.location?.sedeId || (r as any).sede_id || (r as any).sedeId || '');
        return !sId || userSedeIds.has(sId);
      });
    },
    [data, userSedeIds]
  );

  const sedeOptions = useMemo<Option[]>(
    () => sedes.map((s) => ({ value: s.id, label: s.name })).sort((a, b) => a.label.localeCompare(b.label)),
    [sedes]
  );
  const sectorOptions = useMemo<Option[]>(
    () =>
      sectors
        .filter((s) => !sedeId || s.SedeId === sedeId)
        .map((s) => ({ value: s.id, label: s.name }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [sectors, sedeId]
  );
  const areaOptions = useMemo(
    () =>
      buildOptions(
        rows.filter(
          (r) => (!sedeId || r.location.sedeId === sedeId) && (!sectorId || r.location.sectorId === sectorId)
        ),
        (r) => String(r.location.areaId),
        (r) => r.location.areaName
      ),
    [rows, sedeId, sectorId]
  );
  const categoryOptions = useMemo(
    () => buildOptions(rows, (r) => r.checklist?.categoryId ?? '', (r) => r.checklist?.categoryName ?? ''),
    [rows]
  );
  const checklistOptions = useMemo(
    () => buildOptions(rows, (r) => r.checklist?.id ?? '', (r) => getRevisionChecklistName(r)),
    [rows]
  );

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (!sedeId || r.location.sedeId === sedeId) &&
          (!sectorId || r.location.sectorId === sectorId) &&
          (!areaId || String(r.location.areaId) === areaId) &&
          (!categoryId || r.checklist?.categoryId === categoryId) &&
          (!checklistId || r.checklist?.id === checklistId) &&
          (!statusFilter || String(r.status).toLowerCase().trim() === statusFilter.toLowerCase().trim())
      ),
    [rows, sedeId, sectorId, areaId, categoryId, checklistId, statusFilter]
  );

  const sortedFiltered = useMemo(() => {
    return [...filtered].sort((a, b) => getRevisionTime(b) - getRevisionTime(a));
  }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(sortedFiltered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = sortedFiltered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const hasActiveFilters = !!(sedeId || sectorId || areaId || categoryId || checklistId || statusFilter);

  const handleDateChange = (type: 'start' | 'end', value: string) => {
    const [y, m, d] = value.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    if (type === 'start') setStartDate(date);
    else setEndDate(date);
    setCurrentPage(1);
  };

  const handleSedeChange = (v: string) => {
    setSedeId(v);
    setSectorId('');
    setAreaId('');
    setCurrentPage(1);
  };
  const handleSectorChange = (v: string) => {
    setSectorId(v);
    setAreaId('');
    setCurrentPage(1);
  };
  const handleAreaChange = (v: string) => {
    setAreaId(v);
    setCurrentPage(1);
  };
  const handleCategoryChange = (v: string) => {
    setCategoryId(v);
    setCurrentPage(1);
  };
  const handleChecklistChange = (v: string) => {
    setChecklistId(v);
    setCurrentPage(1);
  };
  const handleStatusChange = (v: string) => {
    setStatusFilter(v);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSedeId('');
    setSectorId('');
    setAreaId('');
    setCategoryId('');
    setChecklistId('');
    setStatusFilter('');
    setCurrentPage(1);
  };

  return (
    <>
      {/* Tarjeta de filtros */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6 md:p-8 mb-6 border-0"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DateInput
            label="Fecha inicio"
            value={startDate.toISOString().substring(0, 10)}
            onChange={(v) => handleDateChange('start', v)}
          />
          <DateInput
            label="Fecha fin"
            value={endDate.toISOString().substring(0, 10)}
            onChange={(v) => handleDateChange('end', v)}
          />
          <FilterSelect
            label="Estado"
            placeholder="Todos los estados"
            value={statusFilter}
            options={statusOptions}
            onChange={handleStatusChange}
          />
          <FilterSelect
            label="Sede"
            placeholder="Todas las sedes"
            value={sedeId}
            options={sedeOptions}
            onChange={handleSedeChange}
          />
          <FilterSelect
            label="Sector"
            placeholder="Todos los sectores"
            value={sectorId}
            options={sectorOptions}
            onChange={handleSectorChange}
          />
          <FilterSelect
            label="Área"
            placeholder="Todas las áreas"
            value={areaId}
            options={areaOptions}
            onChange={handleAreaChange}
          />
          <FilterSelect
            label="Categoría"
            placeholder="Todas las categorías"
            value={categoryId}
            options={categoryOptions}
            onChange={handleCategoryChange}
          />
          <FilterSelect
            label="Lista"
            placeholder="Todas las listas"
            value={checklistId}
            options={checklistOptions}
            onChange={handleChecklistChange}
          />
        </div>

        <div className="flex items-center justify-between mt-6">
          <span className="text-sm font-semibold text-slate-500">
            {filtered.length} revisión{filtered.length !== 1 ? 'es' : ''}
            {hasActiveFilters && rows.length !== filtered.length ? ` de ${rows.length}` : ''}
          </span>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </motion.div>

      {/* Tarjeta de tabla */}
      <motion.div
        variants={cardVariants}
        className="relative bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6 md:p-8 flex flex-col flex-1 min-h-0 select-none border-0"
      >
        {error && (
          <div className="mb-4 px-4 py-2 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600 font-medium">
            {error}
          </div>
        )}

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
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td
                        key={j}
                        className="py-2 px-4 bg-[#FAFAFA] first:rounded-l-full last:rounded-r-full"
                      >
                        <div className="h-4 bg-neutral-200 rounded w-16 mx-auto"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState />
                  </td>
                </tr>
              ) : (
                paginated.map((row) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hover:shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-shadow group"
                  >
                    <td className="py-2 px-4 bg-[#FAFAFA] first:rounded-l-full last:rounded-r-full">
                      <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200/60 px-2.5 py-0.5 rounded-full">
                        {row.id}
                      </span>
                    </td>
                    {/* Estado de la revisión */}
                    <td className="py-2 px-4 bg-[#FAFAFA] first:rounded-l-full last:rounded-r-full">
                      <StatusBadge status={row.status} />
                    </td>
                    {/* Checklist Name (Key Field) */}
                    <td className="py-2 px-4 bg-[#FAFAFA] text-slate-800 text-sm font-bold first:rounded-l-full last:rounded-r-full">
                      <span className="truncate max-w-[180px] inline-block" title={getRevisionChecklistName(row)}>
                        {getRevisionChecklistName(row)}
                      </span>
                    </td>
                    <td className="py-2 px-4 bg-[#FAFAFA] text-xs font-bold text-slate-800 first:rounded-l-full last:rounded-r-full">
                      {row.checklist?.categoryName ?? '—'}
                    </td>
                    <td className="py-2 px-4 bg-[#FAFAFA] text-xs text-slate-600 font-semibold first:rounded-l-full last:rounded-r-full">
                      {row.location?.areaName ?? '—'}
                    </td>
                    <td className="py-2 px-4 bg-[#FAFAFA] first:rounded-l-full last:rounded-r-full">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-xs font-bold text-slate-800">
                          {sedeNameById[row.location?.sedeId] || row.location?.sedeName || '—'}
                        </span>
                        <span className="text-[11px] font-medium text-slate-400">
                          {sectorNameById[row.location?.sectorId] || row.location?.sectorName || ''}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-4 bg-[#FAFAFA] text-xs font-semibold text-slate-600 first:rounded-l-full last:rounded-r-full">
                      {formatDate(row.startDate)}
                    </td>
                    <td className="py-2 px-4 bg-[#FAFAFA] first:rounded-l-full last:rounded-r-full">
                      <button
                        onClick={() => openRevision(row.id)}
                        title="Ver ficha en pestaña nueva"
                        className="w-7 h-7 rounded-lg bg-primary-gold text-white flex items-center justify-center hover:opacity-90 transition-all active:scale-95 shadow-sm mx-auto"
                      >
                        <FiEye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Controles de Paginación */}
        <div className="mt-6 flex items-center justify-between flex-shrink-0 flex-wrap gap-4 pt-4 border-t border-slate-100">
          <div className="text-sm font-semibold text-slate-500">
            {filtered.length > 0
              ? `${(safePage - 1) * PAGE_SIZE + 1}-${Math.min(
                  safePage * PAGE_SIZE,
                  filtered.length
                )} de ${filtered.length} resultados`
              : '0 resultados'}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1 || loading}
              className="w-9 h-9 rounded-full bg-primary-gold text-white flex items-center justify-center shadow-md hover:opacity-95 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <FiChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <div className="w-9 h-9 rounded-full bg-primary-gold text-white flex items-center justify-center font-bold text-sm shadow-md select-none">
              {safePage}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages || loading}
              className="w-9 h-9 rounded-full bg-primary-gold text-white flex items-center justify-center shadow-md hover:opacity-95 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <FiChevronRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default RevisionsTable;
