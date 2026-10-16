// src/pages/AutomaticReports/views/AutomaticReportView.tsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAutomaticReportData } from "../hooks/useAutomaticReportData";
import AutomaticReportTable from "../components/AutomaticReportTable";
import AutomaticReportForm from "../components/AutomaticReportForm";
import FormModal from "../../../components/FormModal";
import { FiPlus, FiMail } from "react-icons/fi";

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

const AutomaticReportView: React.FC = () => {
  const { reports, loading, error, reload } = useAutomaticReportData();
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
                <FiMail className="w-6 h-6" />
              </div>
              Reportes Automáticos
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Configuración de los usuarios que reciben por correo los reportes de cada módulo y sede.
            </p>
          </div>

          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center justify-center px-8 py-3 bg-primary-dark text-white rounded-full hover:opacity-90 transition-all shadow-[0_4px_12px_rgba(32,43,52,0.25)] font-bold text-sm active:scale-95 flex-shrink-0"
          >
            <FiPlus className="w-4 h-4 mr-2 stroke-[3]" />
            Nuevo Reporte
          </button>
        </div>
      </motion.div>

      {/* Contenedor Principal de la Tabla */}
      <motion.div variants={cardVariants} className="flex-1 flex flex-col min-h-0">
        <AutomaticReportTable
          reports={reports}
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
        <AutomaticReportForm onSuccess={handleFormSuccess} />
      </FormModal>
    </motion.div>
  );
};

export default AutomaticReportView;
