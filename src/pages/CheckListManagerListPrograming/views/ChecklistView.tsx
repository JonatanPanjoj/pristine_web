// src/pages/CheckListManagerListPrograming/views/ChecklistView.tsx
import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiList, FiRefreshCw } from 'react-icons/fi';
import ChecklistTable, { ChecklistTableHandle } from '../components/ChecklistTable';
import ChecklistForm from '../components/ChecklistForm';
import { syncMissingRevisionsAdapter } from '../adapters/programmings/syncMissingRevisionsAdapter';
import { ExitoCard } from '../../../components/ExitoCard';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const ChecklistGestorView: React.FC = () => {
  const tableRef = useRef<ChecklistTableHandle>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchFields, setSearchFields] = useState<Partial<{ name: string }>>({});
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncCard, setShowSyncCard] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(true);
  const [syncMessage, setSyncMessage] = useState('');

  const handleSearch = () =>
    setSearchFields(searchTerm.trim() ? { name: searchTerm.trim() } : {});

  const handleRefresh = () => {
    setSearchTerm('');
    setSearchFields({});
    tableRef.current?.refresh();
  };

  const handleSaved = () => tableRef.current?.refresh();

  const handleSyncMissingRevisions = async () => {
    setIsSyncing(true);
    try {
      const res = await syncMissingRevisionsAdapter();
      setSyncSuccess(true);
      if (res.syncedCount > 0) {
        setSyncMessage(`Sincronización exitosa. Se crearon ${res.syncedCount} revisiones faltantes del día.`);
      } else {
        setSyncMessage('Todas las revisiones del día ya están al día.');
      }
      setShowSyncCard(true);
    } catch (err: any) {
      setSyncSuccess(false);
      setSyncMessage(err?.message || 'Error al sincronizar revisiones faltantes.');
      setShowSyncCard(true);
    } finally {
      setIsSyncing(false);
    }
  };

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
        className="bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] px-6 py-6 md:px-8 md:py-8 flex-shrink-0 mb-6 border-0"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center">
              <div className="p-2.5 rounded-2xl bg-primary-dark text-white flex items-center justify-center mr-3 flex-shrink-0 shadow-sm">
                <FiList className="w-6 h-6" />
              </div>
              Gestor de Listas de Chequeo
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Administra las listas de revisión, sus categorías, preguntas y programaciones.
            </p>
          </div>
          <button
            onClick={handleSyncMissingRevisions}
            disabled={isSyncing}
            className="flex items-center justify-center px-6 py-3 bg-primary-gold text-white rounded-full hover:opacity-95 transition-all shadow-[0_4px_12px_rgba(221,152,3,0.25)] font-bold text-sm active:scale-95 flex-shrink-0 disabled:opacity-50"
          >
            <FiRefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sincronizando...' : 'Sincronizar Revisiones Faltantes'}
          </button>
        </div>
      </motion.div>

      {/* Formulario de Alta/Edición */}
      <motion.div variants={cardVariants} className="mb-6">
        <ChecklistForm onSaved={handleSaved} />
      </motion.div>

      {/* Toolbar de búsqueda */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-0"
      >
        <div className="relative max-w-md w-full">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-10 pr-4 py-2 bg-slate-100/80 border-0 rounded-full text-xs text-slate-800 placeholder-slate-400 font-semibold focus:outline-none focus:ring-2 focus:ring-primary-gold/40 transition-all"
          />
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-3">
          <button
            onClick={handleSearch}
            className="flex items-center justify-center px-6 py-2 bg-primary-dark text-white text-xs font-bold rounded-full shadow-[0_4px_12px_rgba(32,43,52,0.25)] hover:opacity-90 active:scale-95 transition-all"
          >
            <FiSearch className="w-3.5 h-3.5 mr-2" />
            Buscar
          </button>
          <button
            onClick={handleRefresh}
            className="flex items-center text-slate-500 hover:text-slate-700 transition-colors text-xs font-bold px-4 py-2"
          >
            <FiRefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Actualizar
          </button>
        </div>
      </motion.div>

      {/* Grid / Tabla de tarjetas */}
      <motion.div variants={cardVariants} className="flex-1">
        <ChecklistTable ref={tableRef} searchFields={searchFields} />
      </motion.div>

      {showSyncCard && (
        <ExitoCard
          onClose={() => setShowSyncCard(false)}
          loading={isSyncing}
          success={syncSuccess}
          message={syncMessage}
        />
      )}
    </motion.div>
  );
};

export default ChecklistGestorView;
