import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useUserData } from '../hooks/useUserData';
import { useToggleUserStatus } from '../hooks/useToggleUserStatus';
import ConfirmationModal from '../../../components/ConfirmationModal';
import { ExitoCard } from '../../../components/ExitoCard';
import UserModal from '../components/UserModal';
import { User } from '../../../models/User';
import { formatShortDate } from '../../../utils/formatDateTime';
import {
  FiEye,
  FiPower,
  FiEdit2,
  FiChevronLeft,
  FiChevronRight,
  FiUsers,
  FiSearch,
  FiRefreshCw,
  FiChevronDown
} from 'react-icons/fi';
import { checkAndMigrateIfNeeded } from '../adapters/UserAdapter';

interface UserTableProps {
  searchFields?: Partial<Omit<User, 'id' | 'created_at'>>;
  searchTrigger?: number;
}


// ── Avatar ────────────────────────────────────────────────────────────────────
const UserAvatar: React.FC<{ name: string; url_photo?: string | null }> = ({ name, url_photo }) => {
  const initial = name?.charAt(0)?.toUpperCase() ?? '?';
  return url_photo ? (
    <img src={url_photo} alt={name} className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 shrink-0" />
  ) : (
    <div className="w-9 h-9 rounded-full bg-primary-gold/15 text-primary-gold flex items-center justify-center text-sm font-bold shrink-0">
      {initial}
    </div>
  );
};

// ── Badge de Rol ──────────────────────────────────────────────────────────────
const RoleBadge: React.FC<{ label: string }> = ({ label }) => (
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/60 whitespace-nowrap">
    {label}
  </span>
);

// ── Badge de Estado ───────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ active: boolean }> = ({ active }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${
      active
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
        : 'bg-slate-100 text-slate-500 border-slate-200'
    }`}
  >
    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
    {active ? 'Activo' : 'Inactivo'}
  </span>
);

// ── Componente principal ─────────────────────────────────────────────────────
const UserTable: React.FC<UserTableProps> = ({ searchFields, searchTrigger }) => {
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [appliedSearch, setAppliedSearch] = useState<Partial<Omit<User, 'id' | 'created_at'>>>(searchFields || {});

  const {
    currentPageData,
    loading,
    error,
    loadPage,
    refetch,
    currentPage,
    hasMore,
    getRoleNameById,
    getRoleIdByName,
  } = useUserData({
    pageSize,
    orderByField: 'name',
    orderDirection: 'asc',
    searchFields: appliedSearch,
  });

  const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showExitoCard, setShowExitoCard] = useState(false);
  const [exitoMessage, setExitoMessage] = useState('');
  const [exitoSuccess, setExitoSuccess] = useState(true);

  const { toggleStatus, loading: toggleLoading } = useToggleUserStatus();

  // Verificador de integridad de Firestore en segundo plano
  useEffect(() => {
    checkAndMigrateIfNeeded();
  }, []);

  // Único punto de recarga al activar la búsqueda externa
  const isMounted = React.useRef(false);
  useEffect(() => {
    if (isMounted.current && searchTrigger !== undefined && searchTrigger > 0) {
      refetch();
    }
    isMounted.current = true;
  }, [searchTrigger]);

  const handleSearch = () => {
    const term = searchTerm.trim();
    if (!term) {
      setAppliedSearch({});
    } else {
      setAppliedSearch({
        name: term,
        user: term,
        email: term,
        rol: getRoleIdByName(term),
      });
    }
    loadPage(1);
  };

  const openUserModal = (row: User, mode: 'view' | 'edit') => {
    setSelectedUser(row);
    setModalMode(mode);
    setIsUserModalOpen(true);
  };

  const confirmToggle = async () => {
    if (!selectedUserId) return;
    try {
      await toggleStatus(selectedUserId);
      loadPage(currentPage);
      setExitoMessage('Estado actualizado correctamente.');
      setExitoSuccess(true);
    } catch {
      setExitoMessage('Error al cambiar el estado.');
      setExitoSuccess(false);
    } finally {
      setShowExitoCard(true);
      setIsToggleModalOpen(false);
    }
  };

  const confirmDelete = async () => {
    setIsDeleteModalOpen(false);
    setExitoMessage('Usuario eliminado.');
    setExitoSuccess(true);
    setShowExitoCard(true);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage !== currentPage) loadPage(newPage);
  };

  return (
    <div className="relative bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6 md:p-8 flex flex-col flex-1 min-h-0 select-none">
      {/* Mensajes de Error */}
      {error && (
        <div className="mb-4 px-4 py-2 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700 font-medium">
          {error}
        </div>
      )}

      {/* Fila Superior de Controles (Toolbar) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 mt-1 flex-shrink-0">
        {/* Selector Limitador de Registros */}
        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
          <span>Mostrar:</span>
          <div className="relative">
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="appearance-none bg-primary-dark text-white font-bold px-4 py-1.5 pr-8 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-primary-dark/40 shadow-sm cursor-pointer text-xs"
            >
              <option value={5} className="text-slate-800 font-semibold bg-white">5</option>
              <option value={10} className="text-slate-800 font-semibold bg-white">10</option>
              <option value={25} className="text-slate-800 font-semibold bg-white">25</option>
              <option value={50} className="text-slate-800 font-semibold bg-white">50</option>
            </select>
            <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white pointer-events-none w-3.5 h-3.5" />
          </div>
          <span>resultados por página</span>
        </div>

        {/* Buscador Píldora y Botón Actualizar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <FiSearch
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 cursor-pointer"
              onClick={handleSearch}
            />
            <input
              type="text"
              placeholder="Buscar por nombre, correo, rol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
              className="w-full bg-slate-100/80 border-0 rounded-full pl-10 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-gold/40 transition-all font-semibold"
            />
          </div>

          <button
            onClick={() => refetch()}
            className="flex items-center justify-center bg-primary-dark text-white hover:opacity-90 transition-all text-sm font-semibold px-5 py-2 rounded-full shadow-[0_4px_12px_rgba(32,43,52,0.25)] active:scale-95 w-full sm:w-auto flex-shrink-0"
          >
            <FiRefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </button>
        </div>
      </div>

      {/* Contenedor de la Tabla */}
      <div className="flex-1 overflow-auto min-h-0 scrollbar-none">
        <table className="w-full border-separate border-spacing-y-4 text-center">
          <thead>
            <tr className="text-white text-xs font-bold uppercase tracking-wider">
              <th className="py-2 px-4 bg-primary-gold first:rounded-l-full last:rounded-r-full select-none text-left">Usuario / Nombre</th>
              <th className="py-2 px-4 bg-primary-gold first:rounded-l-full last:rounded-r-full select-none text-left">Correo</th>
              <th className="py-2 px-4 bg-primary-gold first:rounded-l-full last:rounded-r-full select-none">Celular</th>
              <th className="py-2 px-4 bg-primary-gold first:rounded-l-full last:rounded-r-full select-none">Rol</th>
              <th className="py-2 px-4 bg-primary-gold first:rounded-l-full last:rounded-r-full select-none">Estado</th>
              <th className="py-2 px-4 bg-primary-gold first:rounded-l-full last:rounded-r-full select-none">Fecha Registro</th>
              <th className="py-2 px-4 bg-primary-gold first:rounded-l-full last:rounded-r-full select-none">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading || toggleLoading ? (
              // Skeletons formato Píldora
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="py-2 px-4 bg-[#FAFAFA] first:rounded-l-full last:rounded-r-full">
                      <div className="h-4 bg-neutral-200 rounded w-16 mx-auto"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : currentPageData.length === 0 ? (
              // Estado Vacío
              <tr>
                <td colSpan={7} className="py-12 px-4 bg-[#FAFAFA] rounded-full text-slate-500 text-sm font-medium">
                  <FiUsers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  No se encontraron usuarios registrados.
                </td>
              </tr>
            ) : (
              // Filas de Datos
              currentPageData.map((row, idx) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-shadow group"
                >
                  {/* Columna Usuario / Nombre */}
                  <td className="py-2 px-4 bg-[#FAFAFA] first:rounded-l-full last:rounded-r-full text-left">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={row.name} url_photo={row.url_photo} />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate max-w-[160px]">{row.name}</p>
                        <p className="text-xs font-normal text-slate-400 truncate max-w-[160px]">@{row.user}</p>
                      </div>
                    </div>
                  </td>

                  {/* Columna Correo */}
                  <td className="py-2 px-4 bg-[#FAFAFA] text-sm font-normal text-slate-600 first:rounded-l-full last:rounded-r-full text-left">
                    {row.email}
                  </td>

                  {/* Columna Celular */}
                  <td className="py-2 px-4 bg-[#FAFAFA] text-sm font-normal text-slate-600 first:rounded-l-full last:rounded-r-full">
                    {row.phone || '—'}
                  </td>

                  {/* Columna Rol */}
                  <td className="py-2 px-4 bg-[#FAFAFA] first:rounded-l-full last:rounded-r-full">
                    <RoleBadge label={getRoleNameById(row.rol) || row.rol} />
                  </td>

                  {/* Columna Estado */}
                  <td className="py-2 px-4 bg-[#FAFAFA] first:rounded-l-full last:rounded-r-full">
                    <StatusBadge active={row.is_enabled} />
                  </td>

                  {/* Columna Fecha Registro */}
                  <td className="py-2 px-4 bg-[#FAFAFA] text-xs font-normal text-slate-500 first:rounded-l-full last:rounded-r-full">
                    {formatShortDate(row.created_at)}
                  </td>

                  {/* Columna Acciones */}
                  <td className="py-2 px-4 bg-[#FAFAFA] first:rounded-l-full last:rounded-r-full">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openUserModal(row, 'view')}
                        className="w-7 h-7 rounded-lg bg-primary-gold text-white flex items-center justify-center hover:opacity-90 transition-all active:scale-95 shadow-sm"
                        title="Ver detalles"
                      >
                        <FiEye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUserId(row.id);
                          setIsToggleModalOpen(true);
                        }}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-95 shadow-sm ${
                          row.is_enabled
                            ? 'bg-amber-500 text-white hover:opacity-90'
                            : 'bg-slate-300 text-slate-700 hover:bg-slate-400'
                        }`}
                        title={row.is_enabled ? 'Desactivar' : 'Activar'}
                      >
                        <FiPower className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openUserModal(row, 'edit')}
                        disabled={!row.is_enabled}
                        className="w-7 h-7 rounded-lg bg-primary-gold text-white flex items-center justify-center hover:opacity-90 transition-all active:scale-95 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Editar usuario"
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
          Página {currentPage}
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
            disabled={!hasMore || loading}
            className="w-9 h-9 rounded-full bg-primary-gold text-white flex items-center justify-center shadow-md hover:opacity-95 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <FiChevronRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Modales */}
      <ConfirmationModal
        isOpen={isToggleModalOpen}
        message="¿Confirmas cambiar el estado de este usuario?"
        onConfirm={confirmToggle}
        onCancel={() => setIsToggleModalOpen(false)}
      />
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        message="¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer."
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
      {selectedUser && (
        <UserModal
          user={selectedUser}
          isOpen={isUserModalOpen}
          onClose={() => setIsUserModalOpen(false)}
          onSubmit={() => {
            setIsUserModalOpen(false);
            loadPage(currentPage);
          }}
          mode={modalMode}
        />
      )}
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

export default UserTable;
