import React, { useMemo, useState } from 'react';
import {
  FiX,
  FiSearch,
  FiMapPin,
  FiChevronRight,
  FiChevronLeft,
  FiSave,
  FiCheckSquare,
  FiSquare,
} from 'react-icons/fi';
import ModalPortal from '../../../components/ModalPortal';
import { Sede } from '../../../models/Sede';

interface SedeAssignmentModalProps {
  userName: string;
  userEmail?: string;
  sedes: Sede[];
  /** Sedes que el usuario tiene asignadas ahora mismo. */
  assignedIds: string[];
  saving: boolean;
  onClose: () => void;
  onSave: (sedeIds: string[]) => void;
}

/**
 * Asignación masiva de sedes a un usuario, en dos columnas.
 *
 * Disponibles a la izquierda, asignadas a la derecha, y el movimiento entre
 * ellas es explícito. Una sola lista con casillas obliga a recorrerla entera
 * para saber qué tiene asignado alguien; aquí se lee de un vistazo, que es lo
 * que hace falta cuando una persona cubre veinte sedes.
 */
export const SedeAssignmentModal: React.FC<SedeAssignmentModalProps> = ({
  userName,
  userEmail,
  sedes,
  assignedIds,
  saving,
  onClose,
  onSave,
}) => {
  const [assigned, setAssigned] = useState<Set<string>>(() => new Set(assignedIds));
  const [picked, setPicked] = useState<Set<string>>(new Set());

  const [availableSearch, setAvailableSearch] = useState('');
  const [assignedSearch, setAssignedSearch] = useState('');
  const [zone, setZone] = useState('');

  const zones = useMemo(() => collectZones(sedes), [sedes]);

  const available = useMemo(
    () => filterSedes(sedes.filter((sede) => !assigned.has(sede.id)), availableSearch, zone),
    [sedes, assigned, availableSearch, zone]
  );

  const assignedList = useMemo(
    () => filterSedes(sedes.filter((sede) => assigned.has(sede.id)), assignedSearch, ''),
    [sedes, assigned, assignedSearch]
  );

  /** Mover es un acto aparte de elegir: lo elegido se vacía al cruzar de lado. */
  const move = (ids: string[], toAssigned: boolean) => {
    setAssigned((previous) => {
      const next = new Set(previous);
      ids.forEach((id) => (toAssigned ? next.add(id) : next.delete(id)));
      return next;
    });
    setPicked(new Set());
  };

  const togglePicked = (id: string) =>
    setPicked((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const pickedIn = (list: Sede[]) => list.filter((sede) => picked.has(sede.id)).map((sede) => sede.id);

  const changed =
    assigned.size !== assignedIds.length || assignedIds.some((id) => !assigned.has(id));

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        style={{ background: 'rgba(17,24,39,0.5)', backdropFilter: 'blur(3px)' }}
        onClick={(event) => event.target === event.currentTarget && onClose()}
      >
        <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-4xl max-h-[calc(100vh-2rem)] flex flex-col border-0">
          <header className="flex items-start justify-between gap-4 px-6 md:px-8 pt-6 md:pt-8 pb-4 shrink-0">
            <div className="min-w-0">
              <span className="block text-xs font-bold uppercase tracking-wider text-primary-gold">
                Asignación de sedes
              </span>
              <h2 className="text-2xl font-bold text-slate-800 truncate">{userName}</h2>
              {userEmail && <p className="text-sm text-gray-500 mt-0.5 truncate">{userEmail}</p>}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-all shrink-0"
            >
              <FiX className="w-5 h-5" />
            </button>
          </header>

          <div className="flex-1 min-h-0 overflow-y-auto px-6 md:px-8 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-stretch">
              <SedeColumn
                title="Sedes disponibles"
                count={available.length}
                search={availableSearch}
                onSearch={setAvailableSearch}
                sedes={available}
                picked={picked}
                onTogglePicked={togglePicked}
                onSelectAll={() => setPicked(new Set(available.map((sede) => sede.id)))}
                onClearSelection={() => setPicked(new Set())}
                zones={zones}
                zone={zone}
                onZone={setZone}
              />

              <div className="flex md:flex-col items-center justify-center gap-3">
                <MoveButton
                  title="Asignar las sedes elegidas"
                  disabled={pickedIn(available).length === 0}
                  onClick={() => move(pickedIn(available), true)}
                  icon={<FiChevronRight className="w-5 h-5 stroke-[3]" />}
                />
                <MoveButton
                  title="Quitar las sedes elegidas"
                  disabled={pickedIn(assignedList).length === 0}
                  onClick={() => move(pickedIn(assignedList), false)}
                  icon={<FiChevronLeft className="w-5 h-5 stroke-[3]" />}
                />
              </div>

              <SedeColumn
                title="Sedes asignadas"
                count={assignedList.length}
                search={assignedSearch}
                onSearch={setAssignedSearch}
                sedes={assignedList}
                picked={picked}
                onTogglePicked={togglePicked}
                onSelectAll={() => setPicked(new Set(assignedList.map((sede) => sede.id)))}
                onClearSelection={() => setPicked(new Set())}
                highlighted
              />
            </div>
          </div>

          <footer className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 md:px-8 py-5 border-t border-slate-100 shrink-0">
            <span className="text-xs font-semibold text-slate-500">
              {assigned.size} {assigned.size === 1 ? 'sede asignada' : 'sedes asignadas'}
              {changed && <span className="text-primary-gold"> · cambios sin grabar</span>}
            </span>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full transition-all active:scale-95"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => onSave([...assigned])}
                disabled={saving || !changed}
                className="flex items-center px-8 py-2.5 text-xs font-bold text-white bg-primary-dark hover:opacity-90 rounded-full transition-all active:scale-95 shadow-[0_4px_12px_rgba(32,43,52,0.25)] disabled:opacity-40"
              >
                <FiSave className="w-4 h-4 mr-2" />
                {saving ? 'Grabando…' : 'Grabar asignación'}
              </button>
            </div>
          </footer>
        </div>
      </div>
    </ModalPortal>
  );
};

interface SedeColumnProps {
  title: string;
  count: number;
  search: string;
  onSearch: (value: string) => void;
  sedes: Sede[];
  picked: Set<string>;
  onTogglePicked: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  zones?: string[];
  zone?: string;
  onZone?: (zone: string) => void;
  highlighted?: boolean;
}

const SedeColumn: React.FC<SedeColumnProps> = ({
  title,
  count,
  search,
  onSearch,
  sedes,
  picked,
  onTogglePicked,
  onSelectAll,
  onClearSelection,
  zones,
  zone,
  onZone,
  highlighted,
}) => (
  <div
    className={`rounded-[24px] p-4 flex flex-col min-h-[22rem] ${
      highlighted ? 'bg-primary-gold/5 border border-primary-gold/20' : 'bg-[#FAFAFA]'
    }`}
  >
    <div className="flex items-center justify-between gap-2 mb-3">
      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{title}</span>
      <span className="text-[11px] font-bold text-slate-400">{count}</span>
    </div>

    <div className="relative mb-2">
      <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
      <input
        type="text"
        value={search}
        onChange={(event) => onSearch(event.target.value)}
        placeholder="Buscar por nombre, dirección o zona…"
        className="w-full bg-white border-0 rounded-full pl-10 pr-4 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-gold/40"
      />
    </div>

    {zones && onZone && (
      <select
        value={zone}
        onChange={(event) => onZone(event.target.value)}
        className={`mb-2 bg-white border-0 rounded-full px-4 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary-gold/40 ${
          zone ? 'text-primary-gold' : 'text-slate-600'
        }`}
      >
        <option value="">Todas las zonas</option>
        {zones.map((item) => (
          <option key={item} value={item}>
            Zona {item}
          </option>
        ))}
      </select>
    )}

    <div className="flex items-center gap-2 mb-2">
      <ColumnAction label="Seleccionar todos" onClick={onSelectAll} disabled={sedes.length === 0} />
      <ColumnAction label="Limpiar selección" onClick={onClearSelection} />
    </div>

    <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-0">
      {sedes.length === 0 ? (
        <p className="text-xs text-slate-400 italic py-6 text-center">Ninguna sede coincide.</p>
      ) : (
        sedes.map((sede) => (
          <button
            key={sede.id}
            type="button"
            onClick={() => onTogglePicked(sede.id)}
            className={`w-full flex items-start gap-2.5 p-2.5 rounded-2xl text-left transition-all active:scale-[0.99] ${
              picked.has(sede.id)
                ? 'bg-primary-gold text-white shadow-sm'
                : 'bg-white hover:bg-slate-50'
            }`}
          >
            {picked.has(sede.id) ? (
              <FiCheckSquare className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <FiSquare className="w-4 h-4 shrink-0 mt-0.5 text-slate-300" />
            )}

            <span className="min-w-0">
              <span
                className={`block text-xs font-bold truncate ${
                  picked.has(sede.id) ? 'text-white' : 'text-slate-800'
                }`}
              >
                {sede.name}
              </span>
              <span
                className={`block text-[11px] truncate ${
                  picked.has(sede.id) ? 'text-white/80' : 'text-slate-400'
                }`}
              >
                <FiMapPin className="w-3 h-3 inline mr-1" />
                {[sede.address, sede.zone && `Zona ${sede.zone}`].filter(Boolean).join(' · ')}
              </span>
            </span>
          </button>
        ))
      )}
    </div>
  </div>
);

const ColumnAction: React.FC<{ label: string; onClick: () => void; disabled?: boolean }> = ({
  label,
  onClick,
  disabled,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="text-[11px] font-bold text-slate-500 hover:text-primary-gold transition-colors disabled:opacity-40"
  >
    {label}
  </button>
);

const MoveButton: React.FC<{
  title: string;
  icon: React.ReactNode;
  disabled: boolean;
  onClick: () => void;
}> = ({ title, icon, disabled, onClick }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    disabled={disabled}
    className="w-11 h-11 rounded-2xl bg-primary-dark text-white flex items-center justify-center shadow-[0_4px_12px_rgba(32,43,52,0.25)] hover:opacity-90 active:scale-95 transition-all disabled:opacity-30"
  >
    {icon}
  </button>
);

/** Las zonas que existen de verdad entre las sedes, para no ofrecer vacías. */
const collectZones = (sedes: Sede[]): string[] =>
  Array.from(new Set(sedes.map((sede) => sede.zone).filter(Boolean))).sort();

const filterSedes = (sedes: Sede[], search: string, zone: string): Sede[] => {
  const term = search.trim().toLowerCase();

  return sedes.filter((sede) => {
    if (zone && sede.zone !== zone) return false;
    if (!term) return true;

    return [sede.name, sede.address, sede.zone].some((field) =>
      (field || '').toLowerCase().includes(term)
    );
  });
};

export default SedeAssignmentModal;
