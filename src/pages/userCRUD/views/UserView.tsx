import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiUsers } from 'react-icons/fi';
import UserTable from '../components/UserTable';
import UserForm from '../components/UserForm';
import FormModal from '../../../components/FormModal';

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

const UserView: React.FC = () => {
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleFormSuccess = () => {
    setSearchTrigger((prev) => prev + 1);
    setIsFormOpen(false);
  };

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
              <div className="p-2.5 rounded-2xl bg-primary-gold/15 text-primary-gold flex items-center justify-center mr-3 flex-shrink-0">
                <FiUsers className="w-6 h-6" />
              </div>
              Gestión de Usuarios
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Administra el personal, sus roles y el estado de cada cuenta.
            </p>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center justify-center px-8 py-3 bg-primary-dark text-white rounded-full hover:opacity-90 transition-all shadow-[0_4px_12px_rgba(32,43,52,0.25)] font-bold text-sm active:scale-95 flex-shrink-0"
          >
            <FiPlus className="w-4 h-4 mr-2 stroke-[3]" />
            Nuevo Usuario
          </button>
        </div>
      </motion.div>

      {/* Contenedor principal de la tabla - Stretch Completo */}
      <motion.div variants={cardVariants} className="flex-1 flex flex-col min-h-0">
        <UserTable searchTrigger={searchTrigger} />
      </motion.div>

      {/* Modal de alta de usuario */}
      <FormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} maxWidth="max-w-3xl">
        <UserForm onSuccess={handleFormSuccess} />
      </FormModal>
    </motion.div>
  );
};

export default UserView;
