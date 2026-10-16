import React from 'react';
import { FiClock, FiLogIn } from 'react-icons/fi';
import ModalPortal from './ModalPortal';

interface SessionExpiredModalProps {
  onConfirm: () => void;
}

/**
 * Aviso de sesión vencida. No se puede cerrar ni descartar: la sesión ya está
 * cerrada por detrás, así que el único camino es volver a entrar.
 */
const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({ onConfirm }) => (
  <ModalPortal>
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: 'rgba(17,24,39,0.5)', backdropFilter: 'blur(3px)' }}
    >
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md p-6 md:p-8 border-0 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-dark text-white flex items-center justify-center mb-4 shadow-sm">
          <FiClock className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-bold text-slate-800">Sesión expirada</h2>
        <p className="text-sm text-gray-500 mt-2 mb-6">
          Por seguridad cerramos la sesión tras un rato de inactividad. Vuelve a iniciar sesión
          para continuar donde estabas.
        </p>

        <button
          type="button"
          onClick={onConfirm}
          autoFocus
          className="w-full flex items-center justify-center px-8 py-3 bg-primary-dark text-white rounded-full hover:opacity-90 transition-all shadow-[0_4px_12px_rgba(32,43,52,0.25)] font-bold text-sm active:scale-95"
        >
          <FiLogIn className="w-4 h-4 mr-2" />
          Iniciar sesión
        </button>
      </div>
    </div>
  </ModalPortal>
);

export default SessionExpiredModal;
