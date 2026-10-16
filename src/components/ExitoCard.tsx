import React, { useEffect } from 'react';
import ModalPortal from './ModalPortal';

interface ExitoCardProps {
  onClose: () => void;
  loading: boolean;
  success: boolean; // true para éxito, false para error
  message: string; // Mensaje a mostrar
}

export const ExitoCard: React.FC<ExitoCardProps> = ({ onClose, loading, success, message }) => {
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        onClose(); // Cierra el modal después de 2 segundos
      }, 2000); // Cambiado a 2 segundos
      return () => clearTimeout(timer);
    }
  }, [loading, onClose]);

  return (
    <ModalPortal>
      <div className="fixed inset-0 flex items-start justify-end z-50 p-4">
        <div
          className={`relative flex items-center p-4 rounded-lg shadow-lg text-white min-w-[300px] ${success ? 'bg-green-500' : 'bg-red-500'}`}
        >
          <div className="flex items-center flex-grow">
            {success ? (
              <div className="bg-white rounded-full p-2 mr-2">
                <svg
                  className="h-6 w-6 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="bg-white rounded-full p-2 mr-2">
                <svg
                  className="h-6 w-6 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="12" cy="12" r="10" fill="white" />
                  <path fill="red" d="M15.5 8.5L8.5 15.5M8.5 8.5l7 7" />
                </svg>
              </div>
            )}
            <span className="text-base">{message}</span>
          </div>
          <button
            className="ml-4 text-white"
            onClick={onClose}
          >
            x
          </button>
          {/* Barra de sombreado */}
          <div className="absolute bottom-0 right-0 h-1 bg-white rounded-lg" style={{ width: '100%', animation: 'slide-out 2s linear forwards' }} />
        </div>

        <style>
          {`
            @keyframes slide-out {
              0% { width: 100%; }
              100% { width: 0; }
            }
          `}
        </style>
      </div>
    </ModalPortal>
  );
};
