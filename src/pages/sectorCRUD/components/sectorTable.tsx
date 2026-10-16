// src/pages/sectorCRUD/components/sectorTable.tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import useFetchSectors from '../../../components/sectorAll/hooks/useFetchSectors';
import { useToggleSectorStatus } from '../hooks/useToggleSectorStatus';
import getSedeNameBySectorId from '../hooks/getSedeNameBySectorId';
import ConfirmationModal from '../../../components/ConfirmationModal';
import { ExitoCard } from '../../../components/ExitoCard';
import FormModal from '../../../components/FormModal';
import SectorForm from './SectorForm';
import {
  FiPower,
  FiEdit2,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiSearch,
  FiX,
  FiGrid,
} from 'react-icons/fi';

interface SectorTableProps {
  searchFields?: Partial<{ name: string }>;
  setSearchFields?: React.Dispatch<React.SetStateAction<Partial<{ name: string }>>>;
  searchTrigger?: number;
  sedeIds: string[];
  sedes?: any[];
  sedesLoading?: boolean;
  selectedSedeId?: string | null;
  onSedeChange?: (sedeId: string | null) => void;
}

// ── Badge de Estado ───────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ active: boolean }> = ({ active }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
      active
        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
        : 'bg-slate-100 text-slate-500 border border-slate-200/60'
    }`}
  >
    {active ? 'Activo' : 'Inactivo'}
  </span>
);

// ── Componente principal ─────────────────────────────────────────────────────
const SectorTable: React.FC<SectorTableProps> = ({
  searchFields,
  setSearchFields,
  sedeIds,
  sedes = [],
  sedesLoading = false,
  selectedSedeId = null,
  onSedeChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const { sectors, loading, error, totalDocs } = useFetchSectors({
    pageSize,
    searchFields,
    sedeIds,
  });
  const { toggleStatus, loading: toggleLoading, error: toggleError } = useToggleSectorStatus();

  const [localSectors, setLocalSectors] = useState<any[]>([]);
  const [sedeNames, setSedeNames] = useState<{ [key: string]: string }>({});
  const [showExitoCard, setShowExitoCard] = useState(false);
  const [exitoMessage, setExitoMessage] = useState('');
  const [exitoSuccess, setExitoSuccess] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedSector, setSelectedSector] = useState<any | null>(null);

  useEffect(() => {
    setLocalSectors(sectors);
  }, [sectors]);

  useEffect(() => {
    const fetchSedeNames = async () => {
      const newNames = { ...sedeNames };
      let changed = false;
      for (const sector of localSectors) {
        const id = sector.SedeId;
        if (id && !newNames[id]) {
          const name = await getSedeNameBySectorId(id);
          newNames[id] = name || 'Sin nombre';
          changed = true;
        }
      }
      if (changed) setSedeNames(newNames);
    };
    if (localSectors.length > 0) fetchSedeNames();
  }, [localSectors]);

  const handleSearch = () => {
    if (setSearchFields) {
      setSearchFields(searchTerm.trim() ? { name: searchTerm.trim() } : {});
    }
  };

  const confirmToggleStatus = async () => {
    if (selectedSectorId) {
      try {
        await toggleStatus(selectedSectorId);
        setExitoMessage('Estado del sector cambiado con éxito.');
        setExitoSuccess(true);
        setLocalSectors((prev) =>
          prev.map((s) => (s.id === selectedSectorId ? { ...s, is_enabled: !s.is_enabled } : s))
        );
      } catch {
        setExitoMessage('Error al cambiar el estado del sector.');
        setExitoSuccess(false);
      } finally {
        setShowExitoCard(true);
      }
    }
    setIsModalOpen(false);
  };

  const COL_HEADERS = ['Sector', 'Sede', 'Estado', 'Acciones'];

  return (
    <div className="relative bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6 md:p-8 flex flex-col flex-1 min-h-0 select-none border-0">
      {(error || toggleError) && (
        <div className="mb-4 px-4 py-2 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600 font-medium">
          {error || toggleError}
        </div>
      )}

      {/* Fila Superior de Controles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 mt-1 flex-shrink-0">
        {/* Selector de Sede & Limitador */}
        <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-slate-700">
          {/* Sede */}
          <div className="flex items-center gap-2">
            <span>Sede:</span>
            <div className="relative">
              <select
                value={selectedSedeId || ''}
                onChange={(e) => onSedeChange && onSedeChange(e.target.value || null)}
                disabled={sedesLoading}
                className="appearance-none bg-primary-dark text-white font-bold px-4 py-1.5 pr-8 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-primary-dark/40 shadow-sm cursor-pointer text-xs"
              >
                <option value="" className="text-slate-800 font-semibold bg-white">
                  Todas las Sedes
                </option>
                {sedes.map((s: any) => (
                  <option key={s.id} value={s.id} className="text-slate-800 font-semibold bg-white">
                    {s.name}
                  </option>
                ))}
              </select>
              <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white pointer-events-none w-3.5 h-3.5" />
            </div>
          </div>

          {/* Registros */}
          <div className="flex items-center gap-2">
            <span>Mostrar:</span>
            <div className="relative">
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="appearance-none bg-primary-dark text-white font-bold px-4 py-1.5 pr-8 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-primary-dark/40 shadow-sm cursor-pointer text-xs"
              >
                <option value={5} className="text-slate-800 font-semibold bg-white">
                  5
                </option>
                <option value={10} className="text-slate-800 font-semibold bg-white">
                  10
                </option>
                <option value={25} className="text-slate-800 font-semibold bg-white">
                  25
                </option>
                <option value={50} className="text-slate-800 font-semibold bg-white">
                  50
                </option>
              </select>
              <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white pointer-events-none w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Buscador Píldora */}
        <div className="relative w-full sm:w-64">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar sector..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch();
            }}
            className="w-full bg-slate-100/80 border-0 rounded-full pl-10 pr-8 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-gold/40 transition-all font-semibold"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                if (setSearchFields) setSearchFields({});
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <FiX className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Estructura Pildórica de la Tabla */}
      <div className="flex-1 overflow-auto min-h-0 scrollbar-none">
        <table className="w-full border-separate border-spacing-y-4 text-center">
          <thead>
            <tr className="text-white text-xs font-bold uppercase tracking-wider">
              {COL_HEADERS.map((h) => (
                <th
                  key={h}
                  className="py-2 px-4 bg-primary-gold first:rounded-l-full last:rounded-r-full"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <td
                      key={j}
                      className="py-2 px-4 bg-[#FAFAFA] first:rounded-l-full last:rounded-r-full"
                    >
                      <div className="h-4 bg-neutral-200 rounded w-16 mx-auto"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : localSectors.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-slate-400 text-sm font-medium">
                  <FiGrid className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  No se encontraron sectores
                </td>
              </tr>
            ) : (
              localSectors.map((row) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="hover:shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-shadow group"
                >
                  {/* Nombre del Sector (Campo Clave) */}
                  <td className="py-2 px-4 bg-[#FAFAFA] text-slate-800 text-sm font-bold first:rounded-l-full last:rounded-r-full text-left">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary-gold text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
                        {row.name?.charAt(0)?.toUpperCase() ?? '?'}
                      </div>
                      <span className="truncate max-w-[180px]">{row.name}</span>
                    </div>
                  </td>
                  {/* Sede */}
                  <td className="py-2 px-4 bg-[#FAFAFA] first:rounded-l-full last:rounded-r-full text-left">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/60 whitespace-nowrap">
                      {sedeNames[row.SedeId] ?? 'Cargando...'}
                    </span>
                  </td>
                  {/* Estado */}
                  <td className="py-2 px-4 bg-[#FAFAFA] first:rounded-l-full last:rounded-r-full">
                    <StatusBadge active={row.is_enabled} />
                  </td>
                  {/* Acciones */}
                  <td className="py-2 px-4 bg-[#FAFAFA] first:rounded-l-full last:rounded-r-full">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedSectorId(row.id);
                          setIsModalOpen(true);
                        }}
                        title={row.is_enabled ? 'Desactivar' : 'Activar'}
                        className={`w-7 h-7 rounded-lg text-white flex items-center justify-center hover:opacity-90 transition-all active:scale-95 shadow-sm ${
                          row.is_enabled ? 'bg-primary-gold' : 'bg-slate-400'
                        }`}
                      >
                        <FiPower className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedSector(row);
                          setShowFormModal(true);
                        }}
                        disabled={!row.is_enabled}
                        title="Editar sector"
                        className="w-7 h-7 rounded-lg bg-primary-gold text-white flex items-center justify-center hover:opacity-90 transition-all active:scale-95 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <FiEdit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Controles de Paginación */}
      <div className="mt-6 flex items-center justify-between flex-shrink-0 flex-wrap gap-4 pt-4 border-t border-slate-100">
        <div className="text-sm font-semibold text-slate-500">
          {totalDocs} sectores en total
        </div>
      </div>

      {showFormModal && selectedSector && (
        <FormModal
          isOpen={showFormModal}
          onClose={() => {
            setShowFormModal(false);
            setSelectedSector(null);
          }}
          maxWidth="max-w-xl"
        >
          <SectorForm sector={selectedSector} disabled={false} />
        </FormModal>
      )}

      <ConfirmationModal
        isOpen={isModalOpen}
        message="¿Confirmas cambiar el estado de este sector?"
        onConfirm={confirmToggleStatus}
        onCancel={() => setIsModalOpen(false)}
      />

      {showExitoCard && (
        <ExitoCard
          onClose={() => setShowExitoCard(false)}
          loading={toggleLoading}
          success={exitoSuccess}
          message={exitoMessage}
        />
      )}
    </div>
  );
};

export default SectorTable;
