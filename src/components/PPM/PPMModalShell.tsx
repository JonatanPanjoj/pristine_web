import React from 'react';
import { motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import ModalPortal from '../ModalPortal';

interface PPMModalShellProps {
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconWrapperClass?: string;
  maxWidthClass?: string;
  onClose: () => void;
  children: React.ReactNode;
}

// Carcasa común de los modales PPM: fondo difuminado, tarjeta flotante y cabecera.
// El montaje/desmontaje lo controla el padre con <AnimatePresence>.
export const PPMModalShell: React.FC<PPMModalShellProps> = ({
  title,
  subtitle,
  icon: Icon,
  iconWrapperClass = 'bg-primary-dark',
  maxWidthClass = 'max-w-xl',
  onClose,
  children
}) => {
  return (
    <ModalPortal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`bg-white rounded-[32px] p-6 md:p-8 ${maxWidthClass} w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto`}
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div className="flex items-center gap-3">
              {Icon && (
                <div className={`p-2.5 rounded-2xl text-white flex items-center justify-center ${iconWrapperClass}`}>
                  <Icon className="w-6 h-6" />
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-slate-800">{title}</h2>
                {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Cerrar"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {children}
        </motion.div>
      </div>
    </ModalPortal>
  );
};
