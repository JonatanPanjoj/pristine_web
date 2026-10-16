// views/ChecklistReportsView.tsx
// Gestor de Reportes Checklist — cabecera flotante con botón Atrás, barra de
// pestañas oscura (píldora dorada activa) y contenido del reporte seleccionado.
// Los reportes marcados `standalone` traen su propio layout de tarjetas y se
// renderizan sin envoltura; el resto se envuelve en una tarjeta blanca.

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HiOutlineChartBar, HiArrowLeft } from 'react-icons/hi';
import { FiFileText } from 'react-icons/fi';
import { REPORTS, ReportKey, getReport } from '../components/reportsCatalog';

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

const ChecklistReportsView: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<ReportKey | null>(null);
  const active = selectedTab ? getReport(selectedTab) : undefined;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col p-6 md:p-8"
    >
      {/* Cabecera flotante */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] px-6 py-6 md:px-8 md:py-8 flex-shrink-0 mb-6 border-0"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center">
              <HiOutlineChartBar className="w-6 h-6 mr-3 text-primary-gold" />
              {active ? active.label : 'Reportes de Checklist'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">Filtra, selecciona columnas y genera reportes en formato Excel o PDF</p>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold text-white bg-primary-gold shadow-[0_4px_12px_rgba(221,152,3,0.25)] hover:opacity-95 active:scale-95 transition-all shrink-0"
          >
            <HiArrowLeft className="w-4 h-4" />
            Atrás
          </button>
        </div>
      </motion.div>

      {/* Barra segmentada de reportes */}
      <motion.div
        variants={cardVariants}
        className="mb-6 bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-4 md:p-5"
      >
        <div className="bg-slate-100 p-1.5 rounded-full flex gap-1.5 max-w-full overflow-x-auto">
          {REPORTS.map((report) => (
            <button
              key={report.key}
              onClick={() => setSelectedTab(report.key)}
              className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold whitespace-nowrap transition-all active:scale-95 ${
                selectedTab === report.key
                  ? 'bg-white text-primary-gold shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 bg-transparent'
              }`}
            >
              <FiFileText className="w-4 h-4" />
              {report.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Contenido del reporte */}
      {active ? (
        active.standalone ? (
          <motion.div variants={cardVariants}>
            <active.Component />
          </motion.div>
        ) : (
          <motion.div
            variants={cardVariants}
            className="bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6 md:p-8"
          >
            <active.Component />
          </motion.div>
        )
      ) : (
        <motion.div
          variants={cardVariants}
          className="bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6 md:p-8"
        >
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-slate-400">
            <HiOutlineChartBar className="w-10 h-10 text-slate-200" />
            <p className="text-sm font-medium">Gestor de Reportes Checklist</p>
            <p className="text-xs text-slate-300">Selecciona un reporte del menú</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ChecklistReportsView;
