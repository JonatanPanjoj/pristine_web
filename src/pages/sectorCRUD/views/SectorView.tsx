// src/pages/sectorCRUD/views/SectorView.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiGrid } from 'react-icons/fi';
import SectorTable from '../components/sectorTable';
import SectorForm from '../components/SectorForm';
import FormModal from '../../../components/FormModal';
import useEnabledSedesForUser from '../../../publicHooks/sedesEnabled/hooks/useEnabledSedesForUser';

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

const SectorView: React.FC = () => {
  const [searchFields, setSearchFields] = useState<{ name?: string }>({});
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedSedeId, setSelectedSedeId] = useState<string | null>(null);

  const { sedes, loading: sedesLoading } = useEnabledSedesForUser();

  useEffect(() => {
    setSelectedSedeId(null);
  }, [sedes]);

  const handleFormSuccess = () => {
    setShowModal(false);
    setSearchTrigger((prev) => prev + 1);
  };

  const handleSedeChange = (sedeId: string | null) => {
    setSelectedSedeId(sedeId);
  };

  const sedeIds = selectedSedeId ? [selectedSedeId] : [];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col min-h-[calc(100vh-100px)] md:min-h-[calc(100vh-108px)]"
    >
      {/* Encabezado Superior (Header Card) */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] px-6 py-6 md:px-8 md:py-8 flex-shrink-0 mb-6 border-0"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center">
              <div className="p-2.5 rounded-2xl bg-primary-dark text-white flex items-center justify-center mr-3 flex-shrink-0 shadow-sm">
                <FiGrid className="w-6 h-6" />
              </div>
              Gestor de Sectores
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Administración de ubicaciones y sectores por sede en la organización.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center px-8 py-3 bg-primary-dark text-white rounded-full hover:opacity-90 transition-all shadow-[0_4px_12px_rgba(32,43,52,0.25)] font-bold text-sm active:scale-95 flex-shrink-0"
          >
            <FiPlus className="w-4 h-4 mr-2 stroke-[3]" />
            Agregar Sector
          </button>
        </div>
      </motion.div>

      {/* Contenedor Principal de la Tabla */}
      <motion.div variants={cardVariants} className="flex-1 flex flex-col min-h-0">
        <SectorTable
          searchFields={searchFields}
          setSearchFields={setSearchFields}
          searchTrigger={searchTrigger}
          sedeIds={sedeIds}
          sedes={sedes}
          sedesLoading={sedesLoading}
          selectedSedeId={selectedSedeId}
          onSedeChange={handleSedeChange}
        />
      </motion.div>

      {/* Modal de Alta */}
      <FormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        maxWidth="max-w-xl"
      >
        <SectorForm onSuccess={handleFormSuccess} />
      </FormModal>
    </motion.div>
  );
};

export default SectorView;