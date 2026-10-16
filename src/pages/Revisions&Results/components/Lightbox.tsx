// components/Lightbox.tsx
// Visor de imagen a pantalla completa. Compartido por RevisionForm y RevisionView.
// Cierra con clic en el fondo o en la "✕". No usa Escape a propósito: así esa tecla
// no cierra también el modal que está por debajo.

import React from 'react';
import { createPortal } from 'react-dom';
import { HiOutlineX } from 'react-icons/hi';

interface LightboxProps {
  url: string | null;
  onClose: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ url, onClose }) => {
  if (!url) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-primary-dark/80"
      onMouseDown={onClose}
    >
      <img
        src={url}
        alt="Vista completa"
        className="max-w-full max-h-[90vh] rounded-xl object-contain"
        onMouseDown={(e) => e.stopPropagation()}
      />
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center"
      >
        <HiOutlineX className="w-5 h-5" />
      </button>
    </div>,
    document.body
  );
};

export default Lightbox;
