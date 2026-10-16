import React from 'react';
import { motion } from 'framer-motion';
import { FiPlus } from 'react-icons/fi';
import { cardVariants } from './ppmMotion';

interface PPMHeaderProps {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  actionLabel?: string;
  onAction?: () => void;
  children?: React.ReactNode;
}

export const PPMHeader: React.FC<PPMHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  actionLabel,
  onAction,
  children
}) => {
  return (
    <motion.div
      variants={cardVariants}
      className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] px-6 py-6 md:px-8 md:py-8 flex-shrink-0 mb-6 border-0"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Título e Icono Estándar view-design-standards */}
        <div className="flex items-center">
          <div className="p-2.5 rounded-2xl bg-primary-dark text-white flex items-center justify-center mr-3 flex-shrink-0 shadow-sm">
            <Icon className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              {title}
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-normal">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Botón Principal de Acción */}
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="flex items-center justify-center px-8 py-3 bg-primary-dark text-white rounded-full hover:opacity-90 transition-all shadow-[0_4px_12px_rgba(32,43,52,0.25)] font-bold text-sm active:scale-95 flex-shrink-0 cursor-pointer self-start sm:self-auto"
          >
            <FiPlus className="w-4 h-4 mr-2 stroke-[3]" />
            {actionLabel}
          </button>
        )}
      </div>

      {/* Área adicional para pestañas o filtros secundarios */}
      {children && (
        <div className="mt-6 pt-6 border-t border-slate-100">
          {children}
        </div>
      )}
    </motion.div>
  );
};
