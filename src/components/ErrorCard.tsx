import React, { useState } from "react";
import ModalPortal from "./ModalPortal";

interface ErrorCardProps {
  errorMessage: string;
  onClose: () => void; // Añadido para manejar el cierre del modal
}

const ErrorCard: React.FC<ErrorCardProps> = ({ errorMessage, onClose }) => {
  return (
    <ModalPortal>
      <div className="fixed inset-0 flex items-center justify-center z-50">
        {/* Fondo semi-transparente */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={onClose} // Cierra el modal al hacer clic fuera
        ></div>

        {/* Contenido del modal */}
        <div className="bg-white border border-red-300 text-red-700 p-6 rounded-lg shadow-lg z-10 max-w-sm mx-auto">
          <div className="flex items-center mb-4">
            <svg
              className="w-6 h-6 text-red-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <h3 className="ml-3 text-xl font-bold">Error</h3>
          </div>
          <p className="text-gray-700">{errorMessage}</p>
          <button
            onClick={onClose}
            className="mt-4 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded"
          >
            Cerrar
          </button>
        </div>
      </div>
    </ModalPortal>
  );
};

export default ErrorCard;
