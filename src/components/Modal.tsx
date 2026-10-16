import React, { useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import ModalPortal from './ModalPortal';

// ── Tamaños disponibles ───────────────────────────────────────────────────────
type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';

const sizeMap: Record<ModalSize, string> = {
  xs:   'max-w-xs',
  sm:   'max-w-sm',
  md:   'max-w-md',
  lg:   'max-w-lg',
  xl:   'max-w-xl',
  '2xl':'max-w-2xl',
  '3xl':'max-w-3xl',
  '4xl':'max-w-4xl',
  '5xl':'max-w-5xl',
  full: 'max-w-full mx-4',
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Controla el ancho máximo del modal. Default: '2xl' */
  size?: ModalSize;
  /** Oculta el botón X si quieres manejar el cierre solo desde el contenido */
  hideCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  size = '2xl',
  hideCloseButton = false,
}) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOutsideClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)' }}
        onClick={handleOutsideClick}
      >
        <div
          className={`relative bg-white w-full ${sizeMap[size]} max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden`}
          style={{ animation: 'modalIn 0.18s cubic-bezier(0.34,1.56,0.64,1)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <style>{`
          @keyframes modalIn {
            from { opacity: 0; transform: scale(0.96) translateY(6px); }
            to   { opacity: 1; transform: scale(1)    translateY(0);   }
          }
          .modal-inner::-webkit-scrollbar { width: 5px; }
          .modal-inner::-webkit-scrollbar-track { background: transparent; }
          .modal-inner::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 9999px; }
          .modal-inner::-webkit-scrollbar-thumb:hover { background: #FDBA74; }
          `}</style>

          {/* ── Botón cerrar ── */}
          {!hideCloseButton && (
            <button
              onClick={onClose}
              className="absolute top-3.5 right-3.5 z-10 w-7 h-7 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
            >
              <FiX className="w-3.5 h-3.5" />
            </button>
          )}

          {/* ── Contenido con scroll ── */}
          <div className="modal-inner overflow-y-auto flex-1">
            {children}
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default Modal;