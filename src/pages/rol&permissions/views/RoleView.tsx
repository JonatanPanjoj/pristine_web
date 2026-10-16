import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';
import { HiOutlineShieldCheck } from 'react-icons/hi';
import RoleTable from '../components/roleTable';
import useMenuLinks from '../../../route/routerLink/useMenuLinks';

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.05
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24
    }
  }
};

const RoleView: React.FC = () => {
  const navigate = useNavigate();
  const { getLinkByName } = useMenuLinks();

  const [searchTrigger, setSearchTrigger] = useState(0);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col min-h-[calc(100vh-100px)] md:min-h-[calc(100vh-108px)]"
    >
      {/* Cabecera superior flotante */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] px-6 py-6 md:px-8 md:py-8 flex-shrink-0 mb-6 border-0"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center">
              <div className="p-2.5 rounded-2xl bg-primary-dark text-white flex items-center justify-center mr-3 flex-shrink-0 shadow-sm">
                <HiOutlineShieldCheck className="w-6 h-6" />
              </div>
              Gestor de Roles de Permisos
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Administra los roles del sistema y configura sus permisos de acceso.
            </p>
          </div>
          <button
            onClick={() => navigate(getLinkByName('permissionManagerADDRol'))}
            className="flex items-center justify-center px-8 py-3 bg-primary-dark text-white rounded-full hover:opacity-90 transition-all shadow-[0_4px_12px_rgba(32,43,52,0.25)] font-bold text-sm active:scale-95 flex-shrink-0"
          >
            <FiPlus className="w-4 h-4 mr-2 stroke-[3]" />
            Nuevo Rol
          </button>
        </div>
      </motion.div>

      {/* Contenedor principal de la tabla - Stretch Completo */}
      <motion.div variants={cardVariants} className="flex-1 flex flex-col min-h-0">
        <RoleTable searchTrigger={searchTrigger} />
      </motion.div>
    </motion.div>
  );
};

export default RoleView;
