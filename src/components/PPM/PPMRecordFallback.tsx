import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiLoader, FiSearch } from 'react-icons/fi';

interface PPMRecordFallbackProps {
  loading: boolean;
  notFoundTitle: string;
  notFoundMessage: string;
  onBack: () => void;
}

// Estado compartido por las vistas de detalle mientras el registro se carga o
// cuando el identificador de la URL no existe en Firestore.
export const PPMRecordFallback: React.FC<PPMRecordFallbackProps> = ({
  loading,
  notFoundTitle,
  notFoundMessage,
  onBack
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col min-h-[calc(100vh-100px)] md:min-h-[calc(100vh-108px)] font-inter pb-8"
    >
      <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border-0 flex flex-col items-center justify-center text-center gap-4 py-16">
        {loading ? (
          <>
            <FiLoader className="w-8 h-8 text-primary-gold animate-spin" />
            <p className="text-sm font-semibold text-slate-500">Cargando información…</p>
          </>
        ) : (
          <>
            <div className="p-4 rounded-full bg-slate-100 text-slate-400">
              <FiSearch className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">{notFoundTitle}</h2>
              <p className="text-sm text-slate-500 mt-1">{notFoundMessage}</p>
            </div>
            <button
              onClick={onBack}
              className="mt-2 px-8 py-3 bg-primary-dark text-white rounded-full font-bold text-sm hover:opacity-90 transition-all active:scale-95 flex items-center gap-2"
            >
              <FiArrowLeft className="w-4 h-4" /> Volver al listado
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
};
