import React from 'react';

interface PPMModalActionsProps {
  onCancel: () => void;
  isSubmitting: boolean;
  submitLabel: string;
  submittingLabel: string;
  submitClass?: string;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}

// Pie de acciones común de los formularios modales PPM.
export const PPMModalActions: React.FC<PPMModalActionsProps> = ({
  onCancel,
  isSubmitting,
  submitLabel,
  submittingLabel,
  submitClass = 'bg-primary-dark hover:opacity-90',
  icon: Icon,
  disabled = false
}) => (
  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
    <button
      type="button"
      onClick={onCancel}
      className="px-6 py-3 rounded-full text-slate-600 font-semibold text-sm hover:bg-slate-100 transition-colors"
    >
      Cancelar
    </button>
    <button
      type="submit"
      disabled={isSubmitting || disabled}
      className={`px-8 py-3 text-white rounded-full font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${submitClass}`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {isSubmitting ? submittingLabel : submitLabel}
    </button>
  </div>
);
