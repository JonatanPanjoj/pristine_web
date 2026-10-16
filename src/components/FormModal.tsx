// src/components/FormModal.tsx
import React, { useEffect } from "react";
import { FiX } from "react-icons/fi";
import ModalPortal from "./ModalPortal";

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  maxWidth?: string; // clase Tailwind, ej: "max-w-xl", "max-w-3xl"
  children: React.ReactNode;
}

// Modal genérico centrado con overlay oscuro.
// El contenido (un formulario, normalmente) trae su propio header/padding.
const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  maxWidth = "max-w-xl",
  children,
}) => {
  // Cerrar con Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    }; // cierra const onKey
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]); // cierra useEffect

  if (!isOpen) {
    return null;
  } // cierra if (!isOpen)

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto">
        {/* Overlay */}
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

        {/* Card */}
        <div
          className={`relative bg-white rounded-2xl shadow-xl w-full ${maxWidth} z-10 my-auto max-h-[92vh] overflow-y-auto`}
          style={{ animation: "fm-in 0.18s ease forwards" }}
        >
          <button
            onClick={onClose}
            title="Cerrar"
            className="absolute top-3 right-3 z-20 w-8 h-8 rounded-lg flex items-center justify-center bg-white/80 text-gray-500 hover:bg-gray-100 hover:text-gray-700 shadow-sm transition-colors"
          >
            <FiX className="w-4 h-4" />
          </button>

          {children}

          <style>
            {`
              @keyframes fm-in {
                from { opacity: 0; transform: translateY(-8px) scale(.98); }
                to   { opacity: 1; transform: translateY(0)     scale(1);   }
              }
            `}
          </style>
        </div>
      </div>
    </ModalPortal>
  ); // cierra return
}; // cierra const FormModal

export default FormModal;
