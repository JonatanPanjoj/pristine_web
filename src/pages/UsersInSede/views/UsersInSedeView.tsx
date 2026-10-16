// views/UsersInSedeView.tsx
// Asignacion de sedes por usuario: la tabla dice de un vistazo cuantas cubre
// cada quien, y el detalle se trabaja en un modal de dos columnas.

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiArrowLeft, FiSearch, FiRefreshCw, FiEdit2 } from 'react-icons/fi';
import useFetchUsers from '../hooks/useFetchUsers';
import { getEnabledSedesFromCache } from '../../../components/sedesEnabled/adapters/getEnabledSedesFromCache';
import { applyUserSedesToCache, loadAndUpdateSedes } from '../../../services/sedeStorage';
import { updateUserSedes } from '../../userCRUD/adapters/UserAdapter';
import { SedeAssignmentModal } from '../components/SedeAssignmentModal';
import { ExitoCard } from '../../../components/ExitoCard';
import { Sede } from '../../../models/Sede';
import { User } from '../../../models/User';

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const UsersInSedeView: React.FC = () => {
  const navigate = useNavigate();
  const { users, loading: usersLoading } = useFetchUsers();

  const [sedes, setSedes] = useState<Sede[]>([]);
  const [sedesLoading, setSedesLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [exito, setExito] = useState({ show: false, success: true, message: '' });

  const loadSedes = useCallback(async () => {
    setSedesLoading(true);
    try {
      await loadAndUpdateSedes();
      setSedes(getEnabledSedesFromCache());
    } finally {
      setSedesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSedes();
  }, [loadSedes]);

  /** Cuantas sedes cubre cada usuario, contadas una sola vez para toda la tabla. */
  const sedesByUser = useMemo(() => {
    const map = new Map<string, string[]>();
    sedes.forEach((sede) =>
      (sede.user_ids ?? []).forEach((userId) => {
        map.set(userId, [...(map.get(userId) ?? []), sede.id]);
      })
    );
    users.forEach((u) => {
      const userSedes = (u as any).sedes;
      if (Array.isArray(userSedes)) {
        const current = map.get(u.id) ?? [];
        const combined = Array.from(new Set([...current, ...userSedes]));
        map.set(u.id, combined);
      }
    });
    return map;
  }, [sedes, users]);


  const visibleUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;

    return users.filter((user) =>
      [user.name, user.email].some((field) => (field || '').toLowerCase().includes(term))
    );
  }, [users, search]);

  const handleSave = async (sedeIds: string[]) => {
    if (!editing?.id) return;
    setSaving(true);
    try {
      await updateUserSedes(editing.id, sedeIds);
      // El cache se parchea aqui mismo: la tabla y sus contadores se leen de el.
      applyUserSedesToCache(editing.id, sedeIds);
      await loadSedes();
      setEditing(null);
      setExito({ show: true, success: true, message: 'Asignacion guardada exitosamente.' });
    } catch {
      setExito({ show: true, success: false, message: 'Ocurrio un error al guardar la asignacion.' });
    } finally {
      setSaving(false);
    }
  };

  const loading = usersLoading || sedesLoading;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col min-h-[calc(100vh-100px)] md:min-h-[calc(100vh-108px)] select-none"
    >
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] px-6 py-6 md:px-8 md:py-8 flex-shrink-0 mb-6 border-0"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center">
              <div className="p-2.5 rounded-2xl bg-primary-dark text-white flex items-center justify-center mr-3 flex-shrink-0 shadow-sm">
                <FiMapPin className="w-6 h-6" />
              </div>
              Asignacion de Sedes
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Que sedes cubre cada usuario. Abre uno para asignarle varias de una vez.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-center">
            <button
              onClick={loadSedes}
              className="flex items-center bg-primary-dark text-white hover:opacity-90 transition-all text-sm font-semibold px-5 py-2 rounded-full shadow-[0_4px_12px_rgba(32,43,52,0.25)] active:scale-95"
            >
              <FiRefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </button>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center px-6 py-2.5 bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200 transition-all font-bold text-sm active:scale-95"
            >
              <FiArrowLeft className="w-4 h-4 mr-2 stroke-[2.5]" />
              Atras
            </button>
          </div>
        </div>
      </motion.div>

      <div className="relative bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6 md:p-8 flex flex-col flex-1 min-h-0 border-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 flex-shrink-0">
          <span className="text-sm font-bold text-slate-700">
            {visibleUsers.length} de {users.length} usuarios &middot; {sedes.length} sedes habilitadas
          </span>

          <div className="relative w-full sm:w-72">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full bg-slate-100/80 border-0 rounded-full pl-10 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-gold/40 font-semibold"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto min-h-0 scrollbar-none">
          <table className="w-full border-separate border-spacing-y-4 border-spacing-x-0 text-center">
            <thead>
              <tr className="text-white text-xs font-bold uppercase tracking-wider">
                <th className="py-2.5 px-4 bg-primary-gold first:rounded-l-full last:rounded-r-full text-left">Usuario</th>
                <th className="py-2.5 px-4 bg-primary-gold first:rounded-l-full last:rounded-r-full">Sedes asignadas</th>
                <th className="py-2.5 px-4 bg-primary-gold first:rounded-l-full last:rounded-r-full">Asignar</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td colSpan={3} className="py-4 bg-[#FAFAFA] first:rounded-l-full last:rounded-r-full">
                      <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto" />
                    </td>
                  </tr>
                ))
              ) : visibleUsers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 bg-[#FAFAFA] text-slate-400 font-semibold text-sm first:rounded-l-full last:rounded-r-full">
                    Ningun usuario coincide con la busqueda
                  </td>
                </tr>
              ) : (
                visibleUsers.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => setEditing(user)}
                    className="cursor-pointer hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-shadow"
                  >
                    <td className="py-2.5 px-4 bg-[#FAFAFA] text-left first:rounded-l-full last:rounded-r-full">
                      <span className="block text-sm font-bold text-slate-800">{user.name}</span>
                      <span className="block text-xs text-slate-400">{user.email}</span>
                    </td>

                    <td className="py-2.5 px-4 bg-[#FAFAFA]">
                      <SedeCountBadge count={(sedesByUser.get(user.id ?? '') ?? []).length} />
                    </td>

                    <td className="py-2.5 px-4 bg-[#FAFAFA] first:rounded-l-full last:rounded-r-full">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setEditing(user);
                        }}
                        className="flex items-center gap-1.5 mx-auto rounded-full px-4 py-1.5 text-[11px] font-bold bg-primary-gold text-white shadow-sm hover:opacity-90 active:scale-95 transition-all"
                      >
                        <FiEdit2 className="w-3.5 h-3.5" />
                        Asignar sedes
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <SedeAssignmentModal
          userName={editing.name}
          userEmail={editing.email}
          sedes={sedes}
          assignedIds={sedesByUser.get(editing.id ?? '') ?? []}
          saving={saving}
          onClose={() => setEditing(null)}
          onSave={handleSave}
        />
      )}

      {exito.show && (
        <ExitoCard
          onClose={() => setExito((previous) => ({ ...previous, show: false }))}
          loading={saving}
          success={exito.success}
          message={exito.message}
        />
      )}
    </motion.div>
  );
};

/** Cuantas sedes cubre el usuario, en un vistazo. */
const SedeCountBadge: React.FC<{ count: number }> = ({ count }) =>
  count === 0 ? (
    <span className="text-xs font-semibold text-slate-400">Sin sedes</span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-action/10 text-action-700">
      <FiMapPin className="w-3.5 h-3.5" />
      {count} {count === 1 ? 'sede' : 'sedes'}
    </span>
  );

export default UsersInSedeView;
