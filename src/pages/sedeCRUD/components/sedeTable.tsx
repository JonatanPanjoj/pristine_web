import React, { useEffect, useState } from 'react';
import useFetchSedes from '../hooks/useFetchSedes';
import { useToggleSedeStatus } from '../hooks/useToggleSedeStatus';
import Loader from '../../../components/Loader';
import ConfirmationModal from '../../../components/ConfirmationModal';
import { ExitoCard } from '../../../components/ExitoCard';
import Modal from '../../../components/Modal';
import MapComponent from '../components/map';
import SedeForm from './SedeForm';
import { FiEye, FiPower, FiEdit2, FiChevronLeft, FiChevronRight, FiMapPin } from 'react-icons/fi';
import { checkAndMigrateSedesIfNeeded } from '../adapters/getAllSedesAdaper';

interface SedeTableProps {
  searchFields?: Partial<{ name: string }>;
  searchTrigger?: number;
}

// ── Badge de Estado ───────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ active: boolean }> = ({ active }) => (
  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${
    active
      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
      : 'bg-gray-100 text-gray-500 border-gray-200'
  }`}>
    <span className={`w-2 h-2 rounded-full ${active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
    {active ? 'Activa' : 'Inactiva'}
  </span>
);

// ── Botón acción circular ─────────────────────────────────────────────────────
const ActionBtn: React.FC<{
  icon: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  variant?: 'default' | 'danger' | 'active' | 'edit' | 'map';
}> = ({ icon, onClick, disabled, title, variant = 'default' }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all focus:outline-none ${
      disabled
        ? 'opacity-25 cursor-not-allowed bg-gray-100 text-gray-400'
        : variant === 'danger'
          ? 'bg-red-50 text-red-500 hover:bg-red-100'
          : variant === 'edit'
            ? 'bg-sky-50 text-sky-600 hover:bg-sky-100'
            : variant === 'active'
              ? 'bg-orange-50 text-orange-500 hover:bg-orange-100'
              : variant === 'map'
                ? 'bg-teal-50 text-teal-600 hover:bg-teal-100'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
    }`}
  >
    {icon}
  </button>
);

// ── Componente principal ─────────────────────────────────────────────────────
const SedeTable: React.FC<SedeTableProps> = ({ searchFields, searchTrigger }) => {
  const { sedes, loading, error, loadPage, currentPage, totalPages, totalDocs } = useFetchSedes({ pageSize: 10, searchFields });
  const { toggleStatus, loading: toggleLoading, error: toggleError } = useToggleSedeStatus();

  const [localSedes, setLocalSedes] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: string; lng: string } | null>(null);
  const [selectedSede, setSelectedSede] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showExitoCard, setShowExitoCard] = useState(false);
  const [exitoMessage, setExitoMessage] = useState('');
  const [exitoSuccess, setExitoSuccess] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSedeId, setSelectedSedeId] = useState<string | null>(null);

  // ── Auditoría de indexación en segundo plano ──
  useEffect(() => {
    checkAndMigrateSedesIfNeeded();
  }, []); // cierra useEffect de migración

  useEffect(() => {
    if (sedes) setLocalSedes(sedes);
  }, [sedes]);

  const confirmToggleStatus = async () => {
    if (selectedSedeId) {
      try {
        await toggleStatus(selectedSedeId);
        setExitoMessage('Estado de la sede cambiado con éxito.');
        setExitoSuccess(true);
        setLocalSedes((prev) =>
          prev.map((s) => (s.id === selectedSedeId ? { ...s, is_enabled: !s.is_enabled } : s))
        );
      } catch {
        setExitoMessage('Error al cambiar el estado de la sede.');
        setExitoSuccess(false);
      } finally {
        setShowExitoCard(true);
      }
    }
    setIsModalOpen(false);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage !== currentPage) loadPage(newPage);
  };

  const COL_HEADERS = ['Sede', 'Dirección', 'Zona', 'Estado', 'Acciones'];

  return (
    <div className="relative">
      {(loading || toggleLoading) && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
          <Loader />
        </div>
      )}

      {(error || toggleError) && (
        <div className="mx-6 mt-4 mb-2 px-4 py-2 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
          {error || toggleError}
        </div>
      )}

      <div className={`transition-opacity duration-200 ${loading ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {COL_HEADERS.map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {localSedes.length === 0 && !loading ? (
                <tr>
                  <td colSpan={5}>
                    <div className="flex flex-col items-center justify-center gap-2 text-gray-400 py-20 min-h-[320px]">
                      <FiMapPin className="w-10 h-10 text-gray-200" />
                      <p className="text-sm font-medium">No se encontraron sedes</p>
                      <p className="text-xs text-gray-300">Intenta con otro término de búsqueda</p>
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {localSedes.map((row) => (
                    <tr key={row.id} className="hover:bg-orange-50/30 transition-colors duration-100 text-[13px]">
                      <td className="px-5 py-2.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-sm font-semibold shrink-0 shadow-sm">
                            {row.name?.charAt(0)?.toUpperCase() ?? '?'}
                          </div>
                          <p className="text-[13px] font-medium text-gray-900 truncate max-w-[160px]">{row.name}</p>
                        </div>
                      </td>
                      <td className="px-5 py-2.5">
                        <span className="text-[13px] text-gray-600 truncate max-w-[200px] block">{row.address || '—'}</span>
                      </td>
                      <td className="px-5 py-2.5 whitespace-nowrap">
                        <span className="text-[13px] text-gray-600">{row.zone || '—'}</span>
                      </td>
                      <td className="px-5 py-2.5 whitespace-nowrap">
                        <StatusBadge active={row.is_enabled} />
                      </td>
                      <td className="px-5 py-2.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <ActionBtn
                            icon={<FiMapPin className="w-3.5 h-3.5" />}
                            onClick={() => { setCoordinates({ lat: row.latitude, lng: row.length }); setShowModal(true); }}
                            title="Ver mapa"
                            variant="map"
                          />
                          <ActionBtn
                            icon={<FiPower className="w-3.5 h-3.5" />}
                            onClick={() => { setSelectedSedeId(row.id); setIsModalOpen(true); }}
                            title={row.is_enabled ? 'Desactivar' : 'Activar'}
                            variant={row.is_enabled ? 'active' : 'default'}
                          />
                          <ActionBtn
                            icon={<FiEdit2 className="w-3.5 h-3.5" />}
                            onClick={() => { setSelectedSede(row); setIsEditing(true); setShowFormModal(true); }}
                            disabled={!row.is_enabled}
                            title="Editar sede"
                            variant="edit"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {localSedes.length < 5 && (
                    <tr>
                      <td colSpan={5} style={{ height: `${(5 - localSedes.length) * 60}px` }} className="pointer-events-none" />
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Paginación ── */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
          <span className="text-sm text-gray-500">Página {currentPage} · {totalDocs} sedes</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="w-7 h-7 rounded-lg flex items-center justify-center border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              className="w-7 h-7 rounded-lg flex items-center justify-center border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Modales ── */}
      {showModal && coordinates && (
        <Modal isOpen={showModal} onClose={() => { setShowModal(false); setCoordinates(null); }}>
          <MapComponent initialLat={parseFloat(coordinates.lat)} initialLng={parseFloat(coordinates.lng)} mode="view" onExit={() => setShowModal(false)} />
        </Modal>
      )}
      {showFormModal && selectedSede && (
        <Modal isOpen={showFormModal} onClose={() => { setShowFormModal(false); setSelectedSede(null); }}>
          <SedeForm sede={selectedSede} disabled={!isEditing} />
        </Modal>
      )}
      <ConfirmationModal
        isOpen={isModalOpen}
        message="¿Confirmas cambiar el estado de esta sede?"
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

export default SedeTable;
