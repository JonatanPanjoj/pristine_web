// views/CreateRolView.tsx
// Nuevo rol — cabecera flotante premium con botón Atrás + formulario de dos
// tarjetas (datos del rol + permisos).

import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineUserAdd } from 'react-icons/hi';
import RoleForm from '../components/RoleFormAndCreateViewUpdate';
import useMenuLinks from '../../../route/routerLink/useMenuLinks';

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const CreateRolView: React.FC = () => {
  const navigate = useNavigate();
  const { getLinkByName } = useMenuLinks();

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col p-6 md:p-8">
      {/* Cabecera flotante */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] px-6 py-6 md:px-8 md:py-8 flex-shrink-0 mb-6 border-0"
      >
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center">
            <HiOutlineUserAdd className="w-6 h-6 mr-3 text-primary-gold" />
            Nuevo rol
          </h1>
          <button
            onClick={() => navigate(getLinkByName('permissionManager'))}
            className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold text-white bg-primary-gold shadow-[0_4px_12px_rgba(221,152,3,0.25)] hover:opacity-95 active:scale-95 transition-all shrink-0"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            Atrás
          </button>
        </div>
      </motion.div>

      {/* Formulario */}
      <motion.div variants={cardVariants}>
        <RoleForm />
      </motion.div>
    </motion.div>
  );
};

export default CreateRolView;
