// src/pages/Revisions&Results/views/RevisionsView.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { HiOutlineClipboardCheck } from 'react-icons/hi';
import RevisionsTable from '../components/RevisionsTable';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

const RevisionsView: React.FC = () => {
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
        className="bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] px-6 py-6 md:px-8 md:py-8 flex-shrink-0 mb-6 border-0"
      >
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-2xl bg-primary-dark text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <HiOutlineClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Gestor de Revisiones y Resultados
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Historial completo, filtros avanzados y seguimiento de evaluaciones ejecutadas.
            </p>
          </div>
        </div>
      </motion.div>

      <RevisionsTable />
    </motion.div>
  );
};

export default RevisionsView;
