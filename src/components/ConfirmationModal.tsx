import React from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';
import ModalPortal from './ModalPortal';

interface ConfirmationModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  onInputChange?: (text: string) => void;
  inputPlaceholder?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  message,
  onConfirm,
  onCancel,
  onInputChange,
  inputPlaceholder = 'Escribe algo aquí...',
}) => {
  if (!isOpen) return null;

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        style={{ background: 'rgba(17,24,39,0.5)', backdropFilter: 'blur(3px)' }}
        onClick={(e) => e.target === e.currentTarget && onCancel()}
      >
        <div
          className="bg-white rounded-2xl shadow-xl w-full max-w-sm"
          style={{ animation: 'popIn 0.18s cubic-bezier(0.34,1.4,0.64,1)' }}
        >
          <style>{`
            @keyframes popIn {
              from { opacity: 0; transform: scale(0.94); }
              to   { opacity: 1; transform: scale(1); }
            }
          `}</style>

          {/* Header */}
          <div className="flex items-start justify-between px-5 pt-5 pb-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
                <FiAlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Confirmar acción</h3>
                <p className="text-sm text-gray-500 leading-snug">{message}</p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors shrink-0 ml-2"
            >
              <FiX className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Input opcional */}
          {onInputChange && (
            <div className="px-5 pb-3">
              <input
                type="text"
                placeholder={inputPlaceholder}
                onChange={(e) => onInputChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
              />
            </div>
          )}

          {/* Botones */}
          <div className="flex items-center justify-end gap-2 px-5 pb-5 pt-1">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors shadow-sm"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default ConfirmationModal;
