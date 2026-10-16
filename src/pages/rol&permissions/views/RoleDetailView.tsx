// views/RoleDetailView.tsx
// Detalle de un rol (solo lectura) en página completa — reemplaza al modal de
// "Ver". Carga el rol por :roleId y monta el formulario en modo disabled
// (permisos pre-marcados y expandidos).

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineArrowLeft, HiOutlineEye, HiOutlineShieldExclamation } from 'react-icons/hi';
import Loader from '../../../components/Loader';
import RoleForm from '../components/RoleFormAndCreateViewUpdate';
import { getRoleByIdAdapter } from '../adapters/getRoleByIdAdapter';
import useMenuLinks from '../../../route/routerLink/useMenuLinks';
import { Role } from '../../../models/Role';

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const RoleDetailView: React.FC = () => {
  const { roleId } = useParams<{ roleId: string }>();
  const navigate = useNavigate();
  const { getLinkByName } = useMenuLinks();

  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!roleId || fetchedRef.current === roleId) return;
    fetchedRef.current = roleId;
    getRoleByIdAdapter(roleId)
      .then((r) => (r ? setRole(r) : setError('No se encontró el rol.')))
      .catch(() => setError('No se pudo cargar el rol.'))
      .finally(() => setLoading(false));
  }, [roleId]);

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate(getLinkByName('permissionManager'));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 text-slate-400">
        <Loader />
        <span className="text-sm font-semibold">Cargando rol…</span>
      </div>
    );
  }

  if (error || !role) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <HiOutlineShieldExclamation className="w-12 h-12 text-danger-500" />
        <p className="text-sm font-semibold text-slate-700">{error ?? 'Rol no disponible.'}</p>
        <button onClick={goBack}
          className="px-6 py-2.5 rounded-full text-sm font-bold text-white bg-primary-gold hover:opacity-95 active:scale-95 transition-all shadow-[0_4px_12px_rgba(221,152,3,0.25)]">
          Volver
        </button>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col p-6 md:p-8">
      {/* Cabecera */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] px-6 py-6 md:px-8 md:py-8 flex-shrink-0 mb-6 border-0"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center">
              <HiOutlineEye className="w-6 h-6 mr-3 text-primary-gold" />
              Rol: {role.name}
            </h1>
            <p className="text-sm text-gray-500 mt-1">Detalle del rol y sus permisos (solo lectura).</p>
          </div>
          <button onClick={goBack}
            className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold text-white bg-primary-gold shadow-[0_4px_12px_rgba(221,152,3,0.25)] hover:opacity-95 active:scale-95 transition-all shrink-0">
            <HiOutlineArrowLeft className="w-4 h-4" />
            Atrás
          </button>
        </div>
      </motion.div>

      {/* Formulario en modo lectura */}
      <motion.div variants={cardVariants}>
        <RoleForm role={role} disabled />
      </motion.div>
    </motion.div>
  );
};

export default RoleDetailView;
