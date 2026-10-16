import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FiEye,
  FiEdit2,
  FiRotateCcw,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiUsers,
  FiSearch,
  FiRefreshCw,
  FiChevronDown
} from 'react-icons/fi';
import useMenuLinks from '../../../route/routerLink/useMenuLinks';
import Loader from '../../../components/Loader';
import { ExitoCard } from '../../../components/ExitoCard';
import ConfirmationModal from '../../../components/ConfirmationModal';
import Modal from '../../../components/Modal';
import useFetchRoles from '../hooks/useFetchRoles';
import { useToggleRoleStatus } from '../hooks/useToggleRoleStatus';
import RoleForm from './RoleFormAndCreateViewUpdate';
import { Role } from '../../../models/Role';

interface RoleTableProps {
  searchFields?: Partial<{ name: string }>;
  searchTrigger?: number;
}

const COL_HEADERS = ['Nombre del rol', 'Descripción', 'Estado', 'Acciones'];

const RoleTable: React.FC<RoleTableProps> = ({ searchFields, searchTrigger }) => {
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [appliedSearch, setAppliedSearch] = useState<Partial<{ name: string }>>(searchFields || {});

  const { roles, loading, error, loadPage, refetch, currentPage, totalPages, totalDocs } =
    useFetchRoles({ pageSize, searchFields: appliedSearch });
  const { toggleStatus, loading: toggleLoading } = useToggleRoleStatus();
  const navigate = useNavigate();
  const { getLinkByName } = useMenuLinks();

  const openDetail = (id: string) => navigate(getLinkByName('roleDetail').replace(':roleId', id));

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [targetRoleId, setTargetRoleId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [formDisabled, setFormDisabled] = useState(false);
  const [showExito, setShowExito] = useState(false);
  const [exitoMessage, setExitoMessage] = useState('');
  const [exitoSuccess, setExitoSuccess] = useState(true);

  const isMounted = React.useRef(false);
  useEffect(() => {
    if (isMounted.current && searchTrigger !== undefined && searchTrigger > 0) {
      refetch();
    }
    isMounted.current = true;
  }, [searchTrigger]);

  const handleSearch = () => {
    setAppliedSearch(searchTerm.trim() ? { name: searchTerm.trim() } : {});
  };

  const askToggle = (id: string) => {
    setTargetRoleId(id);
    setIsConfirmOpen(true);
  };

  const confirmToggle = async () => {
    if (targetRoleId) {
      try {
        const newStatus = await toggleStatus(targetRoleId);
        const updated = roles.map((r) => (r.id === targetRoleId ? { ...r, is_enabled: newStatus ?? false } : r));
        roles.splice(0, roles.length, ...updated);
        setExitoMessage(`Estado del rol cambiado a ${newStatus ? 'activo' : 'inactivo'}.`);
        setExitoSuccess(true);
      } catch {
        setExitoMessage('Error al cambiar el estado del rol.');
        setExitoSuccess(false);
      } finally {
        setShowExito(true);
      }
    }
    setIsConfirmOpen(false);
  };

  const openForm = (role: Role, disabled: boolean) => {
    setSelectedRole(role);
    setFormDisabled(disabled);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setSelectedRole(null);
    setIsFormOpen(false);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      loadPage(newPage);
    }
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
              placeholder="Buscar por nombre..."
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
              <th className="py-2 px-4 bg-primary-gold first:rounded-l-full last:rounded-r-full select-none text-left">{COL_HEADERS[0]}</th>
              <th className="py-2 px-4 bg-primary-gold first:rounded-l-full last:rounded-r-full select-none text-left">{COL_HEADERS[1]}</th>
              <th className="py-2 px-4 bg-primary-gold first:rounded-l-full last:rounded-r-full select-none">{COL_HEADERS[2]}</th>
              <th className="py-2 px-4 bg-primary-gold first:rounded-l-full last:rounded-r-full select-none">{COL_HEADERS[3]}</th>
            </tr>
          </thead>
          <tbody>
            {loading || toggleLoading ? (
              // Skeletons formato Píldora (5 filas)
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <td key={j} className="py-2 px-4 bg-[#FAFAFA] first:rounded-l-full last:rounded-r-full">
                      <div className="h-4 bg-neutral-200 rounded w-16 mx-auto"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : roles.length === 0 ? (
              // Estado Vacío
              <tr>
                <td colSpan={4} className="py-12 px-4 bg-[#FAFAFA] rounded-full text-slate-500 text-sm font-medium">
                  <FiUsers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  No se encontraron roles registrados.
                </td>
              </tr>
            ) : (
              // Filas de Datos
              roles.map((role, idx) => (
                <motion.tr
                  key={role.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-shadow group"
                >
                  {/* Columna Nombre del rol */}
                  <td className="py-2 px-4 bg-[#FAFAFA] text-sm font-bold text-slate-800 first:rounded-l-full last:rounded-r-full text-left">
                    {role.name}
                  </td>

                  {/* Columna Descripción */}
                  <td className="py-2 px-4 bg-[#FAFAFA] text-sm font-normal text-slate-600 first:rounded-l-full last:rounded-r-full text-left">
                    <span className="line-clamp-1 max-w-[420px]">{role.description || '—'}</span>
                  </td>

                  {/* Columna Estado */}
                  <td className="py-2 px-4 bg-[#FAFAFA] first:rounded-l-full last:rounded-r-full">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${
                        role.is_enabled
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${role.is_enabled ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {role.is_enabled ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>

                  {/* Columna Acciones */}
                  <td className="py-2 px-4 bg-[#FAFAFA] first:rounded-l-full last:rounded-r-full">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openDetail(role.id)}
                        className="w-7 h-7 rounded-lg bg-primary-gold text-white flex items-center justify-center hover:opacity-90 transition-all active:scale-95 shadow-sm"
                        title="Ver detalle"
                      >
                        <FiEye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openForm(role, false)}
                        className="w-7 h-7 rounded-lg bg-primary-gold text-white flex items-center justify-center hover:opacity-90 transition-all active:scale-95 shadow-sm"
                        title="Editar"
                      >
                        <FiEdit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => askToggle(role.id)}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-95 shadow-sm ${
                          role.is_enabled
                            ? 'bg-amber-500 text-white hover:opacity-90'
                            : 'bg-slate-300 text-slate-700 hover:bg-slate-400'
                        }`}
                        title={role.is_enabled ? 'Desactivar' : 'Activar'}
                      >
                        {role.is_enabled ? <FiTrash2 className="w-3.5 h-3.5" /> : <FiRotateCcw className="w-3.5 h-3.5" />}
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
      {!loading && roles.length > 0 && (
        <div className="mt-6 flex items-center justify-between flex-shrink-0 flex-wrap gap-4 pt-4 border-t border-slate-100">
          <div className="text-sm font-semibold text-slate-500">
            {`${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, totalDocs)} de ${totalDocs} resultados`}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-9 h-9 rounded-full bg-primary-gold text-white flex items-center justify-center shadow-md hover:opacity-95 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <FiChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <div className="w-9 h-9 rounded-full bg-primary-gold text-white flex items-center justify-center font-bold text-sm shadow-md select-none">
              {currentPage}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-9 h-9 rounded-full bg-primary-gold text-white flex items-center justify-center shadow-md hover:opacity-95 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <FiChevronRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}

      {/* Confirmación de cambio de estado */}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        message="¿Estás seguro de que quieres cambiar el estado del rol?"
        onConfirm={confirmToggle}
        onCancel={() => setIsConfirmOpen(false)}
      />

      {/* Modal Ver / Editar rol */}
      <Modal isOpen={isFormOpen} onClose={closeForm}>
        <div className="p-6 overflow-y-auto max-h-[75vh]">
          {selectedRole && <RoleForm role={selectedRole} disabled={formDisabled} />}
        </div>
      </Modal>

      {showExito && (
        <ExitoCard onClose={() => setShowExito(false)} loading={toggleLoading} success={exitoSuccess} message={exitoMessage} />
      )}
    </div>
  );
};

export default RoleTable;
