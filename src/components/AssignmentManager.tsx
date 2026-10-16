// components/AssignmentManager.tsx
// Asignador usuario ↔ destino (sedes, categorías, …) orientado a volumen: se
// eligen los usuarios y TODAS sus asignaciones se gestionan en una sola lista
// buscable y filtrable, asignando o quitando en la propia fila.
// Diseño según view-design-standards SKILL.

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FiMapPin, FiArrowLeft, FiSave, FiRotateCcw } from 'react-icons/fi';
import AssignmentUserPicker from './assignment/AssignmentUserPicker';
import AssignmentTargetList from './assignment/AssignmentTargetList';
import AssignmentSummaryTable from './assignment/AssignmentSummaryTable';
import { AssignUser, AssignTarget, AssignmentChange, AssignmentState } from './assignment/assignmentTypes';

export type { AssignUser, AssignTarget, AssignmentChange };

interface AssignmentManagerProps {
  title: string;
  subtitle?: string;
  targetsTitle: string;
  targetNounSingular: string;
  targetNounPlural: string;
  users: AssignUser[];
  targets: AssignTarget[];
  headerIcon?: React.ReactNode;
  targetIcon?: React.ReactNode;
  loading?: boolean;
  saving?: boolean;
  onSave: (changes: AssignmentChange[]) => Promise<void>;
  onBack?: () => void;
}

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const AssignmentManager: React.FC<AssignmentManagerProps> = ({
  title,
  subtitle,
  targetsTitle,
  targetNounSingular,
  targetNounPlural,
  users,
  targets,
  headerIcon,
  targetIcon,
  loading,
  saving,
  onSave,
  onBack,
}) => {
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [assignIds, setAssignIds] = useState<Set<string>>(new Set());
  const [unassignIds, setUnassignIds] = useState<Set<string>>(new Set());

  const selectedUserIds = useMemo(() => [...selectedUsers], [selectedUsers]);
  const selectedUserList = useMemo(() => users.filter((u) => selectedUsers.has(u.id)), [users, selectedUsers]);

  /** Estado del destino según las asignaciones ya guardadas de los usuarios elegidos. */
  const baseState = (targetId: string): AssignmentState => {
    const target = targets.find((t) => t.id === targetId);
    if (!target || selectedUserIds.length === 0) return 'none';
    const count = selectedUserIds.filter((id) => target.assignedUserIds.includes(id)).length;
    return count === 0 ? 'none' : count === selectedUserIds.length ? 'all' : 'some';
  };

  // Un clic alterna; el segundo clic cancela el cambio y vuelve al estado guardado.
  const toggleTarget = (targetId: string) => {
    if (assignIds.has(targetId)) {
      setAssignIds((prev) => removeFrom(prev, targetId));
      return;
    }
    if (unassignIds.has(targetId)) {
      setUnassignIds((prev) => removeFrom(prev, targetId));
      return;
    }
    if (baseState(targetId) === 'all') {
      setUnassignIds((prev) => addTo(prev, targetId));
    } else {
      setAssignIds((prev) => addTo(prev, targetId));
    }
  };

  const setMany = (targetIds: string[], assign: boolean) => {
    const nextAssign = new Set(assignIds);
    const nextUnassign = new Set(unassignIds);

    targetIds.forEach((id) => {
      const base = baseState(id);
      if (assign) {
        nextUnassign.delete(id);
        if (base === 'all') nextAssign.delete(id);
        else nextAssign.add(id);
      } else {
        nextAssign.delete(id);
        if (base === 'none') nextUnassign.delete(id);
        else nextUnassign.add(id);
      }
    });

    setAssignIds(nextAssign);
    setUnassignIds(nextUnassign);
  };

  // Cambios netos por usuario: solo lo que realmente cambia para cada uno.
  const changes = useMemo<AssignmentChange[]>(() => {
    const assigned = (targetId: string, userId: string) =>
      targets.find((t) => t.id === targetId)?.assignedUserIds.includes(userId) ?? false;

    return selectedUserList
      .map((u) => ({
        userId: u.id,
        addTargetIds: [...assignIds].filter((id) => !assigned(id, u.id)),
        removeTargetIds: [...unassignIds].filter((id) => assigned(id, u.id)),
      }))
      .filter((c) => c.addTargetIds.length || c.removeTargetIds.length);
  }, [selectedUserList, assignIds, unassignIds, targets]);

  const pendingAdds = changes.reduce((total, c) => total + c.addTargetIds.length, 0);
  const pendingRemoves = changes.reduce((total, c) => total + c.removeTargetIds.length, 0);
  const canSave = changes.length > 0 && !saving;

  const discardChanges = () => {
    setAssignIds(new Set());
    setUnassignIds(new Set());
  };

  const handleSave = async () => {
    if (!canSave) return;
    await onSave(changes);
    discardChanges();
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col min-h-[calc(100vh-100px)] md:min-h-[calc(100vh-108px)]"
    >
      {/* Encabezado */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] px-6 py-6 md:px-8 md:py-8 flex-shrink-0 mb-6 border-0"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center">
              <div className="p-2.5 rounded-2xl bg-primary-dark text-white flex items-center justify-center mr-3 flex-shrink-0 shadow-sm">
                {headerIcon || targetIcon || <FiMapPin className="w-6 h-6" />}
              </div>
              {title}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {subtitle || 'Gestión y asignación de usuarios por ubicación y sede.'}
            </p>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center justify-center px-6 py-2.5 bg-primary-dark text-white rounded-full hover:opacity-90 transition-all shadow-[0_4px_12px_rgba(32,43,52,0.25)] font-bold text-sm active:scale-95 flex-shrink-0"
            >
              <FiArrowLeft className="w-4 h-4 mr-2 stroke-[2.5]" />
              Atrás
            </button>
          )}
        </div>
      </motion.div>

      {/* Usuarios + asignaciones */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        <motion.div variants={cardVariants} className="lg:col-span-2">
          <AssignmentUserPicker
            users={users}
            selectedIds={selectedUsers}
            loading={loading}
            onToggle={(userId) =>
              setSelectedUsers((prev) => (prev.has(userId) ? removeFrom(prev, userId) : addTo(prev, userId)))
            }
            onClear={() => setSelectedUsers(new Set())}
          />
        </motion.div>

        <motion.div variants={cardVariants} className="lg:col-span-3">
          <AssignmentTargetList
            targetsTitle={targetsTitle}
            targetNounSingular={targetNounSingular}
            targetNounPlural={targetNounPlural}
            targets={targets}
            selectedUserIds={selectedUserIds}
            assignIds={assignIds}
            unassignIds={unassignIds}
            icon={targetIcon}
            loading={loading}
            onToggleTarget={toggleTarget}
            onSetMany={setMany}
          />
        </motion.div>
      </div>

      {/* Resumen de lo que se va a grabar */}
      <motion.div variants={cardVariants} className="mb-6">
        <AssignmentSummaryTable
          users={selectedUserList}
          targets={targets}
          assignIds={assignIds}
          unassignIds={unassignIds}
          targetNounPlural={targetNounPlural}
          onRemoveUser={(userId) => setSelectedUsers((prev) => removeFrom(prev, userId))}
        />
      </motion.div>

      {/* Barra de guardado */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] px-6 py-4 md:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
      >
        <div className="text-sm font-semibold text-slate-600">
          {selectedUserList.length === 0 ? (
            <span className="text-slate-400">Sin usuarios seleccionados</span>
          ) : changes.length === 0 ? (
            <span className="text-slate-400">
              {selectedUserList.length} usuario{selectedUserList.length !== 1 ? 's' : ''} · sin cambios pendientes
            </span>
          ) : (
            <span>
              {selectedUserList.length} usuario{selectedUserList.length !== 1 ? 's' : ''} ·{' '}
              {pendingAdds > 0 && <span className="text-emerald-600 font-bold">+{pendingAdds} a asignar</span>}
              {pendingAdds > 0 && pendingRemoves > 0 && ' · '}
              {pendingRemoves > 0 && <span className="text-rose-600 font-bold">−{pendingRemoves} a quitar</span>}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={discardChanges}
            disabled={changes.length === 0}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FiRotateCcw className="w-4 h-4" />
            Descartar
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="flex items-center gap-2 px-8 py-2.5 bg-primary-dark text-white rounded-full hover:opacity-90 transition-all shadow-[0_4px_12px_rgba(32,43,52,0.25)] font-bold text-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FiSave className="w-4 h-4" />
            {saving ? 'Grabando…' : 'Grabar cambios'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const addTo = (set: Set<string>, id: string) => {
  const next = new Set(set);
  next.add(id);
  return next;
};

const removeFrom = (set: Set<string>, id: string) => {
  const next = new Set(set);
  next.delete(id);
  return next;
};

export default AssignmentManager;
