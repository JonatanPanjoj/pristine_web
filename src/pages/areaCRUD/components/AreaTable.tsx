// src/pages/areaCRUD/components/AreaTable.tsx
import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import useFetchAreas from '../hooks/useFetchAreas';
import { useToggleAreaStatus } from '../hooks/useToggleAreaStatus';
import getSedeNameBySectorId from '../hooks/getSedeNameBySectorId';
import { fetchSectorName } from '../hooks/fetchSectorName';
import ConfirmationModal from '../../../components/ConfirmationModal';
import { ExitoCard } from '../../../components/ExitoCard';
import FormModal from '../../../components/FormModal';
import AreaForm from './AreaForm';
import QRCodeGenerator from './QRCodeGenerator';
import {
  FiPower,
  FiEdit2,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiSearch,
  FiX,
  FiLayers,
} from 'react-icons/fi';
import { BsQrCode } from 'react-icons/bs';

interface AreaTableProps {
  searchFields?: Partial<{ name: string }>;
  setSearchFields?: React.Dispatch<React.SetStateAction<Partial<{ name: string }>>>;
  searchTrigger?: number;
  sectorIds?: string[];
  sedes?: any[];
  sedesLoading?: boolean;
  selectedSedeId?: string | null;
  onSedeChange?: (sedeId: string | null) => void;
  sectors?: any[];
  sectorsLoading?: boolean;
  selectedSectorId?: string | null;
  onSectorChange?: (sectorId: string | null) => void;
}

// ── Componentes Badge ────────────────────────────────────────────────────────
const CodeBadge: React.FC<{ code: number }> = React.memo(({ code }) => (
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
    {code.toString().padStart(4, '0')}
  </span>
));
CodeBadge.displayName = 'CodeBadge';

const StatusBadge: React.FC<{ active: boolean }> = React.memo(({ active }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${active
        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
        : 'bg-slate-100 text-slate-500 border border-slate-200/60'
      }`}
  >
    {active ? 'Activa' : 'Inactiva'}
  </span>
));
StatusBadge.displayName = 'StatusBadge';

// ── Componente principal ──
const AreaTable: React.FC<AreaTableProps> = ({
  searchFields,
  setSearchFields,
  sectorIds,
  sedes = [],
  sedesLoading = false,
  selectedSedeId = null,
  onSedeChange,
  sectors = [],
  sectorsLoading = false,
  selectedSectorId = null,
  onSectorChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const { areas, loading, error, loadPage, currentPage, totalPages, totalDocs } = useFetchAreas({
    pageSize,
    searchFields,
    sectorIds,
  });
  const { toggleStatus, loading: toggleLoading, error: toggleError } = useToggleAreaStatus();

  const [localAreas, setLocalAreas] = useState<any[]>([]);
  const [noDataFetched, setNoDataFetched] = useState(false);
  const [showExitoCard, setShowExitoCard] = useState(false);
  const [exitoMessage, setExitoMessage] = useState('');
  const [exitoSuccess, setExitoSuccess] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedArea, setSelectedArea] = useState<any | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrCodeValue, setQrCodeValue] = useState('');

  // CACHÉ EN MEMORIA MEDIANTE REFS
  const sedesCache = useRef<Record<string, string>>({});
  const sectoresCache = useRef<Record<string, string>>({});

  useEffect(() => {
    let isMounted = true;

    const fetchNames = async () => {
      if (areas.length === 0) {
        if (isMounted) {
          setNoDataFetched(true);
          setLocalAreas([]);
        }
        return;
      }

      if (isMounted) setNoDataFetched(false);

      const areasWithNames = await Promise.all(
        areas.map(async (area: any) => {
          const sId = area.SedeId || area.sede_id;
          let sedeName = '—';
          if (sId) {
            if (sedesCache.current[sId]) {
              sedeName = sedesCache.current[sId];
            } else {
              try {
                sedeName = (await getSedeNameBySectorId(sId)) ?? '—';
                sedesCache.current[sId] = sedeName;
              } catch (e) {
                console.error(e);
              }
            }
          }

          const secId = area.SectorId || area.sector_id;
          let sectorName = '—';
          if (secId) {
            if (sectoresCache.current[secId]) {
              sectorName = sectoresCache.current[secId];
            } else {
              try {
                sectorName = (await fetchSectorName(secId)) ?? '—';
                sectoresCache.current[secId] = sectorName;
              } catch (e) {
                console.error(e);
              }
            }
          }

          const isEnabled = area.is_enabled !== false && area.status !== false;
          return { ...area, sedeName, sectorName, is_enabled: isEnabled };
        })
      );

      if (isMounted) {
        setLocalAreas(areasWithNames);
      }
    };

    fetchNames();

    return () => {
      isMounted = false;
    };
  }, [areas]);

  const handleSearch = () => {
    if (setSearchFields) {
      setSearchFields(searchTerm.trim() ? { name: searchTerm.trim() } : {});
    }
  };

  const confirmToggleStatus = async () => {
    if (selectedAreaId) {
      try {
        await toggleStatus(selectedAreaId);
        setExitoMessage('Estado del área cambiado con éxito.');
        setExitoSuccess(true);
        setLocalAreas((prev) =>
          prev.map((a) => (a.id === selectedAreaId ? { ...a, is_enabled: !a.is_enabled } : a))
        );
      } catch {
        setExitoMessage('Error al cambiar el estado del área.');
        setExitoSuccess(false);
      } finally {
        setShowExitoCard(true);
      }
    }
    setIsModalOpen(false);
  };

  const handleOpenQrModal = (area: any) => {
    const qrData = `${area.name}\nCódigo: ${area.area_id.toString().padStart(4, '0')}\nSede: ${area.sedeName}\nNivel: ${area.level}`.trim();
    setQrCodeValue(qrData);
    setQrModalOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage !== currentPage) loadPage(newPage);
  };

  const COL_HEADERS = ['Código', 'Área', 'Sede', 'Sector', 'Nivel', 'Estado', 'Acciones'];

  return (
    <div className="relative bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6 md:p-8 flex flex-col flex-1 min-h-0 select-none border-0">
      {(error || toggleError) && (
        <div className="mb-4 px-4 py-2 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600 font-medium">
          {error || toggleError}
        </div>
      )}

      {/* Fila Superior de Controles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 mt-1 flex-shrink-0">
        {/* Filtros de Sede / Sector & Limitador */}
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

          {/* Sector */}
          <div className="flex items-center gap-2">
            <span>Sector:</span>
            <div className="relative">
              <select
                value={selectedSectorId || ''}
                onChange={(e) => onSectorChange && onSectorChange(e.target.value || null)}
                disabled={sectorsLoading}
                className="appearance-none bg-primary-dark text-white font-bold px-4 py-1.5 pr-8 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-primary-dark/40 shadow-sm cursor-pointer text-xs disabled:opacity-50"
              >
                <option value="" className="text-slate-800 font-semibold bg-white">
                  Todos los Sectores
                </option>
                {sectors.map((sec: any) => (
                  <option key={sec.id} value={sec.id} className="text-slate-800 font-semibold bg-white">
                    {sec.name}
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
            placeholder="Buscar área..."
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
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td
                      key={j}
                      className="py-2 px-4 bg-[#FAFAFA] first:rounded-l-full last:rounded-r-full"
                    >
                      <div className="h-4 bg-neutral-200 rounded w-16 mx-auto"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : noDataFetched || localAreas.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 text-sm font-medium">
                  <FiLayers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  No se encontraron áreas
                </td>
              </tr>
            ) : (
              localAreas.map((row) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="hover:shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-shadow group"
                >
                  {/* Código */}
                  <td className="py-2 px-4 bg-[#FAFAFA] first:rounded-l-full last:rounded-r-full">
                    <CodeBadge code={row.area_id} />
                  </td>

                  {/* Nombre del Área (Campo Clave) */}
                  <td className="py-2 px-4 bg-[#FAFAFA] text-slate-800 text-sm font-bold first:rounded-l-full last:rounded-r-full text-left">
                    <div className="flex items-center gap-2.5">
                      {/* <div className="w-8 h-8 rounded-full bg-primary-gold text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
                        {row.name?.charAt(0)?.toUpperCase() ?? '?'}
                      </div> */}
                      <span className="truncate max-w-[150px]">{row.name}</span>
                    </div>
                  </td>

                  {/* Sede */}
                  <td className="py-2 px-4 bg-[#FAFAFA] first:rounded-l-full last:rounded-r-full text-left">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/60 whitespace-nowrap">
                      {row.sedeName}
                    </span>
                  </td>

                  {/* Sector */}
                  <td className="py-2 px-4 bg-[#FAFAFA] first:rounded-l-full last:rounded-r-full text-left">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/60 whitespace-nowrap">
                      {row.sectorName}
                    </span>
                  </td>

                  {/* Nivel */}
                  <td className="py-2 px-4 bg-[#FAFAFA] text-slate-600 text-xs font-medium first:rounded-l-full last:rounded-r-full">
                    {row.level || '—'}
                  </td>

                  {/* Estado */}
                  <td className="py-2 px-4 bg-[#FAFAFA] first:rounded-l-full last:rounded-r-full">
                    <StatusBadge active={row.is_enabled} />
                  </td>

                  {/* Acciones */}
                  <td className="py-2 px-4 bg-[#FAFAFA] first:rounded-l-full last:rounded-r-full">
                    <div className="flex items-center justify-center gap-2">
                      {/* Generar QR */}
                      <button
                        onClick={() => handleOpenQrModal(row)}
                        title="Generar QR"
                        className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center hover:opacity-90 transition-all active:scale-95 shadow-sm"
                      >
                        <BsQrCode className="w-3.5 h-3.5" />
                      </button>
                      {/* Activar/Desactivar */}
                      <button
                        onClick={() => {
                          setSelectedAreaId(row.id);
                          setIsModalOpen(true);
                        }}
                        title={row.is_enabled ? 'Desactivar' : 'Activar'}
                        className={`w-7 h-7 rounded-lg text-white flex items-center justify-center hover:opacity-90 transition-all active:scale-95 shadow-sm ${row.is_enabled ? 'bg-primary-gold' : 'bg-slate-400'
                          }`}
                      >
                        <FiPower className="w-3.5 h-3.5" />
                      </button>
                      {/* Editar */}
                      <button
                        onClick={() => {
                          setSelectedArea(row);
                          setShowFormModal(true);
                        }}
                        disabled={!row.is_enabled}
                        title="Editar área"
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
          {totalDocs > 0
            ? `${(currentPage - 1) * pageSize + 1}-${Math.min(
              currentPage * pageSize,
              totalDocs
            )} de ${totalDocs} resultados`
            : "0 resultados"}
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="w-9 h-9 rounded-full bg-primary-gold text-white flex items-center justify-center shadow-md hover:opacity-95 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <FiChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <div className="w-9 h-9 rounded-full bg-primary-gold text-white flex items-center justify-center font-bold text-sm shadow-md select-none">
            {currentPage}
          </div>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            className="w-9 h-9 rounded-full bg-primary-gold text-white flex items-center justify-center shadow-md hover:opacity-95 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <FiChevronRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {showFormModal && selectedArea && (
        <FormModal
          isOpen={showFormModal}
          onClose={() => {
            setShowFormModal(false);
            setSelectedArea(null);
          }}
          maxWidth="max-w-2xl"
        >
          <AreaForm area={selectedArea} disabled={false} />
        </FormModal>
      )}

      {qrModalOpen && (
        <FormModal isOpen={qrModalOpen} onClose={() => setQrModalOpen(false)} maxWidth="max-w-md">
          <div className="text-center p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Código QR de Ubicación</h3>
            <QRCodeGenerator text={qrCodeValue} />
            <button
              onClick={() => setQrModalOpen(false)}
              className="mt-6 px-6 py-2.5 bg-primary-dark text-white rounded-full hover:opacity-90 transition-all font-bold text-xs shadow-sm"
            >
              Cerrar
            </button>
          </div>
        </FormModal>
      )}

      <ConfirmationModal
        isOpen={isModalOpen}
        message="¿Confirmas cambiar el estado de esta área?"
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

export default AreaTable;