// src/pages/VersionApp/views/VersionView.tsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useVersionData } from "../hooks/useVersionData";
import VersionTable from "../components/VersionTable";
import VersionForm from "../components/VersionForm";
import FormModal from "../../../components/FormModal";
import { FiPlus, FiLayers } from "react-icons/fi";

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
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
};

const VersionView: React.FC = () => {
  const { versions, loading, error, reload } = useVersionData();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleFormSuccess = () => {
    reload();
    setIsFormOpen(false);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col min-h-[calc(100vh-100px)] md:min-h-[calc(100vh-108px)]"
    >
      {/* Encabezado Superior (Header Card) */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] px-6 py-6 md:px-8 md:py-8 flex-shrink-0 mb-6 border-0"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center">
              <div className="p-2.5 rounded-2xl bg-primary-dark text-white flex items-center justify-center mr-3 flex-shrink-0 shadow-sm">
                <FiLayers className="w-6 h-6" />
              </div>
              Gestión de Versiones
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Administración de versiones del sistema y descargas de aplicaciones móviles.
            </p>
          </div>

          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center justify-center px-8 py-3 bg-primary-dark text-white rounded-full hover:opacity-90 transition-all shadow-[0_4px_12px_rgba(32,43,52,0.25)] font-bold text-sm active:scale-95 flex-shrink-0"
          >
            <FiPlus className="w-4 h-4 mr-2 stroke-[3]" />
            Nueva Versión
          </button>
        </div>
      </motion.div>

      {/* Contenedor Principal de la Tabla */}
      <motion.div variants={cardVariants} className="flex-1 flex flex-col min-h-0">
        <VersionTable
          versions={versions}
          loading={loading}
          error={error}
          reload={reload}
        />
      </motion.div>

      {/* Modal de alta */}
      <FormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        maxWidth="max-w-xl"
      >
        <VersionForm onSuccess={handleFormSuccess} />
      </FormModal>
    </motion.div>
  );
};

export default VersionView;
