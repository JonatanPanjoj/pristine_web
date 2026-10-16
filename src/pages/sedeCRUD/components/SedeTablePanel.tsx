// src/pages/sedeCRUD/components/SedeTablePanel.tsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import useFetchSedes from "../hooks/useFetchSedes";
import { useSoftDeleteSede } from "../hooks/useSoftDeleteSede";
import { Sede } from "../../../models/Sede";
import ConfirmationModal from "../../../components/ConfirmationModal";
import { ExitoCard } from "../../../components/ExitoCard";
import { checkAndMigrateSedesIfNeeded } from "../adapters/getAllSedesAdaper";
import {
  FiSearch,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiImage,
  FiChevronLeft,
  FiChevronRight,
  FiMapPin,
  FiChevronDown,
  FiX,
} from "react-icons/fi";

interface SedeTablePanelProps {
  onEdit: (sede: Sede) => void;
  onView: (sede: Sede) => void;
  refreshSignal: number;
}

const COL_HEADERS = ["Nombre de Sede", "Dirección", "Código", "Editar", "Ver", "Logo", "Eliminar"];

const SedeTablePanel: React.FC<SedeTablePanelProps> = ({
  onEdit,
  onView,
  refreshSignal,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFields, setSearchFields] = useState<{ name?: string }>({});
  const [pageSize, setPageSize] = useState(5);
  const { sedes, loading, error, loadPage, currentPage, totalPages, totalDocs } =
    useFetchSedes({ pageSize, searchFields });

  const { softDelete, loading: deleting } = useSoftDeleteSede();
  const [deleteSede, setDeleteSede] = useState<Sede | null>(null);

  const [showExito, setShowExito] = useState(false);
  const [exitoSuccess, setExitoSuccess] = useState(true);
  const [exitoMessage, setExitoMessage] = useState("");

  // Auditoría/migración de tokens al montar
  useEffect(() => {
    checkAndMigrateSedesIfNeeded();
  }, []);

  // Recarga cuando el padre lo pide (tras guardar)
  useEffect(() => {
    if (refreshSignal > 0) loadPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshSignal]);

  const handleSearch = () => {
    setSearchFields(searchTerm.trim() ? { name: searchTerm.trim() } : {});
  };

  const confirmDelete = async () => {
    if (!deleteSede?.id) return;
    const ok = await softDelete(deleteSede.id);
    setDeleteSede(null);
    setExitoSuccess(ok);
    setExitoMessage(ok ? "Sede desactivada." : "No se pudo desactivar la sede.");
    setShowExito(true);
    if (ok) loadPage(currentPage);
  };

  return (
    <div className="relative bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6 md:p-8 flex flex-col flex-1 min-h-0 select-none border-0">
      {error && (
        <div className="mb-4 px-4 py-2 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600 font-medium">
          {error}
        </div>
      )}

      {/* Fila Superior de Controles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 mt-1 flex-shrink-0">
        {/* Selector Limitador de Registros */}
        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
          <span>Mostrar:</span>
          <div className="relative">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
              }}
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
          <span>por página</span>
        </div>

        {/* Buscador Píldora */}
        <div className="relative w-full sm:w-64">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar sede..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            className="w-full bg-slate-100/80 border-0 rounded-full pl-10 pr-8 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-gold/40 transition-all font-semibold"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSearchFields({});
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
            ) : sedes.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 text-sm font-medium">
                  <FiMapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  No se encontraron sedes
                </td>
              </tr>
            ) : (
              sedes.map((row) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="hover:shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-shadow group"
                >
                  {/* Nombre de Sede (Campo Clave) */}
                  <td className="py-2 px-4 bg-[#FAFAFA] text-slate-800 text-sm font-bold first:rounded-l-full last:rounded-r-full text-left">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary-gold text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
                        {row.name?.charAt(0)?.toUpperCase() ?? "?"}
                      </div>
                      <span className="truncate max-w-[140px]">{row.name}</span>
                    </div>
                  </td>
                  {/* Dirección */}
                  <td className="py-2 px-4 bg-[#FAFAFA] text-slate-600 text-sm font-normal first:rounded-l-full last:rounded-r-full text-left">
                    <span className="truncate max-w-[180px] block">{row.address || "—"}</span>
                  </td>
                  {/* Código */}
                  <td className="py-2 px-4 bg-[#FAFAFA] text-slate-500 text-xs font-normal first:rounded-l-full last:rounded-r-full">
                    {row.sede_id || "—"}
                  </td>
                  {/* Editar */}
                  <td className="py-2 px-4 bg-[#FAFAFA] first:rounded-l-full last:rounded-r-full">
                    <button
                      onClick={() => onEdit(row)}
                      title="Editar"
                      className="w-7 h-7 rounded-lg bg-primary-gold text-white flex items-center justify-center hover:opacity-90 transition-all active:scale-95 shadow-sm mx-auto"
                    >
                      <FiEdit2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                  {/* Ver mapa */}
                  <td className="py-2 px-4 bg-[#FAFAFA] first:rounded-l-full last:rounded-r-full">
                    <button
                      onClick={() => onView(row)}
                      title="Ver en el mapa"
                      className="w-7 h-7 rounded-lg bg-primary-gold text-white flex items-center justify-center hover:opacity-90 transition-all active:scale-95 shadow-sm mx-auto"
                    >
                      <FiEye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                  {/* Logo */}
                  <td className="py-2 px-4 bg-[#FAFAFA] first:rounded-l-full last:rounded-r-full">
                    {row.url_photo ? (
                      <img
                        src={row.url_photo}
                        alt={row.name}
                        className="w-8 h-8 rounded-lg object-cover border border-slate-200 mx-auto"
                      />
                    ) : (
                      <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <FiImage className="w-4 h-4" />
                      </span>
                    )}
                  </td>
                  {/* Eliminar */}
                  <td className="py-2 px-4 bg-[#FAFAFA] first:rounded-l-full last:rounded-r-full">
                    <button
                      onClick={() => setDeleteSede(row)}
                      title="Eliminar (desactivar)"
                      className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 border border-rose-200/60 hover:bg-rose-100 flex items-center justify-center active:scale-95 transition-all shadow-sm mx-auto"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
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
            onClick={() => currentPage > 1 && loadPage(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="w-9 h-9 rounded-full bg-primary-gold text-white flex items-center justify-center shadow-md hover:opacity-95 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <FiChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <div className="w-9 h-9 rounded-full bg-primary-gold text-white flex items-center justify-center font-bold text-sm shadow-md select-none">
            {currentPage}
          </div>
          <button
            onClick={() => currentPage < totalPages && loadPage(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            className="w-9 h-9 rounded-full bg-primary-gold text-white flex items-center justify-center shadow-md hover:opacity-95 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <FiChevronRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={!!deleteSede}
        message={`¿Eliminar la sede "${deleteSede?.name ?? ""}"? Quedará desactivada y podrás reactivarla luego.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteSede(null)}
      />

      {showExito && (
        <ExitoCard
          onClose={() => setShowExito(false)}
          loading={deleting}
          success={exitoSuccess}
          message={exitoMessage}
        />
      )}
    </div>
  );
};

export default SedeTablePanel;
