import React, { useState } from 'react';
import Modal from '../../../components/Modal'; // Asegúrate de que la ruta sea correcta
import MapComponent from './map';

const ParentComponent: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  const handleSaveLocation = (lat: number, lng: number) => {
    setCoordinates({ lat, lng });
    setShowModal(false); // Cerrar el modal
  };

  const handleExitModal = () => {
    setShowModal(false); // Cerrar el modal sin guardar
  };

  return (
    <div>
      {/* Botón para abrir el modal en modo Edit */}
      <button
        onClick={() => {
          setMode('edit');
          setShowModal(true);
        }}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
      >
        Editar ubicación
      </button>

      {/* Botón para abrir el modal en modo View */}
      <button
        onClick={() => {
          setMode('view');
          setShowModal(true);
        }}
        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded ml-4"
      >
        Ver ubicación
      </button>

      {/* Mostrar coordenadas seleccionadas */}
      {coordinates && (
        <div className="mt-4">
          <p>Latitud seleccionada: {coordinates.lat}</p>
          <p>Longitud seleccionada: {coordinates.lng}</p>
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={showModal} onClose={handleExitModal}>
        <MapComponent
          initialLat={coordinates?.lat}
          initialLng={coordinates?.lng}
          mode={mode}
          onSave={handleSaveLocation}
          onExit={handleExitModal}
        />
      </Modal>
    </div>
  );
};

export default ParentComponent;
