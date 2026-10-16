// components/Modal.tsx

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// 🌟 Añadimos tamaños más robustos (como '2xl' y 'full')
type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: ModalSize;
  closeOnBackdrop?: boolean;
}

// 🌟 Ajustamos los anchos máximos para formularios complejos
const sizeMap: Record<ModalSize, string> = {
  sm: 'max-w-md',      // 448px
  md: 'max-w-2xl',     // 672px
  lg: 'max-w-4xl',     // 896px
  xl: 'max-w-6xl',     // 1152px
  '2xl': 'max-w-7xl',  // 1280px (Ideal para RevisionForm con múltiples columnas)
  full: 'max-w-[95vw]', // Usa el 95% del ancho de la pantalla completa
};

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  size = '2xl', // 🌟 Cambiamos el valor por defecto a '2xl' para que sea espacioso
  closeOnBackdrop = true,
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const id = requestAnimationFrame(() => setShow(true));
      return () => cancelAnimationFrame(id);
    }
    setShow(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center p-4 transition-opacity duration-200 ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
      onMouseDown={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-primary-dark/60 backdrop-blur-sm" />

      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${sizeMap[size]} transition-all duration-200 ${
          show ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'
        }`}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;