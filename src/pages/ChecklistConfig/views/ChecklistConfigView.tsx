// src/pages/ChecklistConfig/views/ChecklistConfigView.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BsQrCodeScan } from 'react-icons/bs';
import { FiSave, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { useChecklistConfig } from '../hooks/useChecklistConfig';

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.05 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

const ChecklistConfigView: React.FC = () => {
  const { config, loading, saving, error, success, saveConfig } = useChecklistConfig();
  const [requireQR, setRequireQR] = useState(false);

  useEffect(() => {
    if (config) {
      setRequireQR(config.requireQR);
    }
  }, [config]);

  const handleSave = () => {
    saveConfig({ requireQR });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-gold"></div>
      </div>
    );
  }

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
            <BsQrCodeScan className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Configuración de Escaneo QR en Checklist
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Establece si es obligatorio el escaneo de códigos QR para iniciar auditorías y revisiones en sitio.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Cuerpo Principal de Configuración */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6 md:p-8 flex-1 border-0"
      >
        <div className="max-w-2xl">
          <h2 className="text-base font-bold text-slate-800 mb-2">
            Método de inicio para Operadores
          </h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed font-medium">
            Determina cómo deben acceder los operadores a los cuestionarios de revisión de checklists en la aplicación móvil. Si requieres el escaneo de QR, los operadores deberán validar físicamente su presencia en el área escaneando el código QR impreso.
          </p>

          {/* Control de Pestañas Segmentadas Píldora */}
          <div className="bg-slate-100/80 p-1.5 rounded-full flex gap-2 w-full max-w-md mb-8">
            <button
              onClick={() => setRequireQR(false)}
              className={`px-6 py-2.5 rounded-full text-xs font-bold w-1/2 text-center transition-all focus:outline-none ${
                !requireQR
                  ? 'bg-primary-dark text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-700 bg-transparent'
              }`}
            >
              Sin QR (Directo)
            </button>
            <button
              onClick={() => setRequireQR(true)}
              className={`px-6 py-2.5 rounded-full text-xs font-bold w-1/2 text-center transition-all focus:outline-none ${
                requireQR
                  ? 'bg-primary-dark text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-700 bg-transparent'
              }`}
            >
              QR Obligatorio
            </button>
          </div>

          {/* Mensajes de Alerta */}
          {error && (
            <div className="flex items-center gap-2 mb-6 p-4 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200/60 text-xs font-semibold">
              <FiAlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 mb-6 p-4 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-semibold">
              <FiCheckCircle className="w-5 h-5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Botón Guardar Cambios */}
          <div className="flex justify-start">
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-bold text-sm bg-primary-dark text-white shadow-[0_4px_12px_rgba(32,43,52,0.25)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none"
            >
              <FiSave className="w-4 h-4" />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ChecklistConfigView;
