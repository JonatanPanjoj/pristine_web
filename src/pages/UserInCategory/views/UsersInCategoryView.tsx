// views/UsersInCategoryView.tsx
// Asignación de Categorías ↔ Usuarios (muchos-a-muchos) con el asignador compartido.

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTag } from 'react-icons/fi';
import useFetchUsers from '../hooks/useFetchUsers';
import useToggleUserInCategorias from '../hooks/useToggleUserInCategorias';
import fetchCategorias from '../../../components/CategoryChecklist/hooks/fetchCategorias';
import AssignmentManager, { AssignTarget, AssignmentChange } from '../../../components/AssignmentManager';
import { ExitoCard } from '../../../components/ExitoCard';

const UsersInCategoryView: React.FC = () => {
  const navigate = useNavigate();
  const { users, loading: usersLoading } = useFetchUsers();
  const { addUser, removeUser, loading: saving } = useToggleUserInCategorias();

  const [targets, setTargets] = useState<AssignTarget[]>([]);
  const [targetsLoading, setTargetsLoading] = useState(true);
  const [exito, setExito] = useState({ show: false, success: true, message: '' });

  const loadCategorias = useCallback(async () => {
    setTargetsLoading(true);
    try {
      const { categorias } = await fetchCategorias();
      setTargets((categorias || []).map((c) => ({ id: c.id, name: c.name, assignedUserIds: c.users_id ?? [] })));
    } finally {
      setTargetsLoading(false);
    }
  }, []);

  useEffect(() => { loadCategorias(); }, [loadCategorias]);

  const handleSave = async (changes: AssignmentChange[]) => {
    try {
      for (const c of changes) {
        if (c.addTargetIds.length) await addUser(c.addTargetIds, c.userId);
        if (c.removeTargetIds.length) await removeUser(c.removeTargetIds, c.userId);
      }
      setTargets((prev) => prev.map((t) => {
        const ids = new Set(t.assignedUserIds);
        for (const c of changes) {
          if (c.addTargetIds.includes(t.id)) ids.add(c.userId);
          if (c.removeTargetIds.includes(t.id)) ids.delete(c.userId);
        }
        return { ...t, assignedUserIds: [...ids] };
      }));
      setExito({ show: true, success: true, message: 'Asignaciones guardadas exitosamente.' });
    } catch {
      setExito({ show: true, success: false, message: 'Ocurrió un error al guardar las asignaciones.' });
    }
  };

  return (
    <>
      <AssignmentManager
        title="Asignación de Categorías"
        subtitle="Administración y asignación de categorías de checklist por usuario."
        targetsTitle="Categorías disponibles"
        targetNounSingular="categoría"
        targetNounPlural="categorías"
        headerIcon={<FiTag className="w-6 h-6" />}
        targetIcon={<FiTag className="w-4 h-4" />}
        users={users.map((u) => ({ id: u.id, name: u.name, email: u.email }))}
        targets={targets}
        loading={usersLoading || targetsLoading}
        saving={saving}
        onSave={handleSave}
        onBack={() => navigate(-1)}
      />
      {exito.show && (
        <ExitoCard onClose={() => setExito((e) => ({ ...e, show: false }))} loading={saving} success={exito.success} message={exito.message} />
      )}
    </>
  );
};

export default UsersInCategoryView;
