// src/pages/AutomaticReports/components/AutomaticReportTable.tsx
import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { formatShortDate } from "../../../utils/formatDateTime";
import { AutomaticReport } from "../../../models/AutomaticReport";
import { useDeleteAutomaticReport } from "../hooks/useDeleteAutomaticReport";
import { useSedeOptions } from "../hooks/useSedeOptions";
import AutomaticReportModal from "./AutomaticReportModal";
import ConfirmationModal from "../../../components/ConfirmationModal";
import { ExitoCard } from "../../../components/ExitoCard";
import { getReportModuleLabel } from "../constants/reportModules";
import {
  getPeriodLabel,
  getWeekDayLabel,
  isChecklistModule,
} from "../constants/reportSchedule";
import {
  FiEye,
  FiEdit2,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiSearch,
  FiX,
} from "react-icons/fi";

interface AutomaticReportTableProps {
  reports: AutomaticReport[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

const TOTAL_COLUMNS = 8;
const SKELETON_ROWS = 5;

// ── Formateador de fecha ──
const formatDate = (date?: any): string => {
  return formatShortDate(date);
};

const AutomaticReportTable: React.FC<AutomaticReportTableProps> = ({
  reports,
  loading,
  error,
  reload,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AutomaticReport | null>(null);
  const [modalMode, setModalMode] = useState<"view" | "edit">("view");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { removeAutomaticReport, loading: deleting } = useDeleteAutomaticReport();
  const { toNames } = useSedeOptions();

  // ── ExitoCard ──
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  // Búsqueda en cliente por usuario / correo / módulo
  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return reports;
    return reports.filter(
      (r) =>
        r.rep_usuario_nombre?.toLowerCase().includes(term) ||
        r.rep_correo?.toLowerCase().includes(term) ||
        getReportModuleLabel(r.rep_modulo).toLowerCase().includes(term)
    );
  }, [reports, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const pageData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const openModal = (row: AutomaticReport, mode: "view" | "edit") => {
    setSelected(row);
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const ok = await removeAutomaticReport(deleteId);
    setIsDeleteOpen(false);
    setDeleteId(null);
    setSuccess(ok);
    setMessage(ok ? "Reporte eliminado." : "No se pudo eliminar el reporte.");
    setShowSuccessCard(true);
    if (ok) reload();
  };

  const handlePageChange = (newPage: number) => {
    setPage(Math.max(1, Math.min(newPage, totalPages)));
  };

  return (
    <div className="relative bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6 md:p-8 flex flex-col flex-1 min-h-0 select-none">
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
                setPage(1);
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
          <span>resultados por página</span>
        </div>

        {/* Buscador Píldora */}
        <div className="relative w-full sm:w-64">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar destinatario..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-100/80 border-0 rounded-full pl-10 pr-8 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-gold/40 transition-all font-semibold"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
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
              <th className="py-2 px-4 bg-primary-gold first:rounded-l-full last:rounded-r-full">
                Usuario
              </th>
              <th className="py-2 px-4 bg-primary-gold first:rounded-l-full last:rounded-r-full">
                Correo
              </th>
              <th className="py-2 px-4 bg-primary-gold first:rounded-l-full last:rounded-r-full">
                Tipo
              </th>
              <th className="py-2 px-4 bg-primary-gold first:rounded-l-full last:rounded-r-full">
                Programación
              </th>
              <th className="py-2 px-4 bg-primary-gold first:rounded-l-full last:rounded-r-full">
                Sedes
              </th>
              <th className="py-2 px-4 bg-primary-gold first:rounded-l-full last:rounded-r-full">
                Estado
              </th>
              <th className="py-2 px-4 bg-primary-gold first:rounded-l-full last:rounded-r-full">
                Fecha Update
              </th>
              <th className="py-2 px-4 bg-primary-gold first:rounded-l-full last:rounded-r-full">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: TOTAL_COLUMNS }).map((_, j) => (
                    <td
                      key={j}
                      className="py-2 px-4 bg-[#FAFAFA] first:rounded-l-full last:rounded-r-full"
                    >
                      <div className="h-4 bg-neutral-200 rounded w-16 mx-auto"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : pageData.length === 0 ? (
              <tr>
                <td
                  colSpan={TOTAL_COLUMNS}
                  className="py-12 text-center text-slate-400 text-sm font-medium"
                >
                  No hay reportes automáticos registrados
                </td>
              </tr>
            ) : (
              pageData.map((row) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="hover:shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-shadow group"
                >
                  {/* Usuario (Campo Clave) */}
                  <td className="py-2 px-4 bg-[#FAFAFA] first:rounded-l-full last:rounded-r-full">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary-gold/15 text-primary-gold flex items-center justify-center text-xs font-bold shrink-0">
                        {row.rep_usuario_nombre?.charAt(0)?.toUpperCase() ?? "?"}
                      </div>
                      <span className="text-slate-800 text-sm font-bold">
                        {row.rep_usuario_nombre || "—"}
                      </span>
                    </div>
                  </td>
                  {/* Correo */}
                  <td className="py-2 px-4 bg-[#FAFAFA] text-slate-600 text-sm font-normal first:rounded-l-full last:rounded-r-full">
                    {row.rep_correo || "—"}
                  </td>
                  {/* Tipo */}
                  <td className="py-2 px-4 bg-[#FAFAFA] first:rounded-l-full last:rounded-r-full">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/60">
                      {getReportModuleLabel(row.rep_modulo)}
                    </span>
                  </td>
                  {/* Programación */}
                  <td className="py-2 px-4 bg-[#FAFAFA] text-slate-600 text-xs font-normal first:rounded-l-full last:rounded-r-full">
                    <span className="font-semibold text-slate-700">{row.rep_hora || "—"}</span>
                    <span className="block text-slate-400">
                      {getPeriodLabel(row.rep_periodo)}
                      {isChecklistModule(row.rep_modulo) &&
                        ` · ${getWeekDayLabel(row.rep_dia_semana)}`}
                    </span>
                  </td>
                  {/* Sedes */}
                  <td className="py-2 px-4 bg-[#FAFAFA] text-slate-600 text-sm font-normal first:rounded-l-full last:rounded-r-full">
                    <SedeCell
                      allSedes={row.rep_todas_sedes}
                      names={toNames(row.rep_sedes ?? [])}
                    />
                  </td>
                  {/* Estado */}
                  <td className="py-2 px-4 bg-[#FAFAFA] first:rounded-l-full last:rounded-r-full">
                    <StatusBadge isEnabled={row.rep_is_enabled} />
                  </td>
                  {/* Fecha Update */}
                  <td className="py-2 px-4 bg-[#FAFAFA] text-slate-500 text-xs font-normal first:rounded-l-full last:rounded-r-full">
                    {formatDate(row.rep_fecha_update)}
                  </td>
                  {/* Acciones */}
                  <td className="py-2 px-4 bg-[#FAFAFA] first:rounded-l-full last:rounded-r-full">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openModal(row, "view")}
                        title="Ver detalles"
                        className="w-7 h-7 rounded-lg bg-primary-gold text-white flex items-center justify-center hover:opacity-90 transition-all active:scale-95 shadow-sm"
                      >
                        <FiEye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openModal(row, "edit")}
                        title="Editar"
                        className="w-7 h-7 rounded-lg bg-primary-gold text-white flex items-center justify-center hover:opacity-90 transition-all active:scale-95 shadow-sm"
                      >
                        <FiEdit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setDeleteId(row.id ?? null);
                          setIsDeleteOpen(true);
                        }}
                        title="Eliminar"
                        className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 border border-rose-200/60 hover:bg-rose-100 flex items-center justify-center active:scale-95 transition-all shadow-sm"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
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
          {filtered.length > 0
            ? `${(currentPage - 1) * pageSize + 1}-${Math.min(
                currentPage * pageSize,
                filtered.length
              )} de ${filtered.length} resultados`
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

      {/* Modal ver/editar */}
      {selected && (
        <AutomaticReportModal
          report={selected}
          isOpen={isModalOpen}
          mode={modalMode}
          onClose={() => setIsModalOpen(false)}
          onSubmit={() => {
            setIsModalOpen(false);
            reload();
          }}
        />
      )}

      {/* Confirmación eliminar */}
      <ConfirmationModal
        isOpen={isDeleteOpen}
        message="¿Seguro que quieres eliminar este reporte automático? Esta acción no se puede deshacer."
        onConfirm={confirmDelete}
        onCancel={() => {
          setIsDeleteOpen(false);
          setDeleteId(null);
        }}
      />

      {showSuccessCard && (
        <ExitoCard
          onClose={() => setShowSuccessCard(false)}
          loading={deleting}
          success={success}
          message={message}
        />
      )}
    </div>
  );
};

// ── Celda de sedes ──
// Muestra "Todas" o el conteo con las primeras sedes como tooltip.
const SedeCell: React.FC<{ allSedes: boolean; names: string[] }> = ({
  allSedes,
  names,
}) => {
  if (allSedes) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
        Todas
      </span>
    );
  } // cierra if (allSedes)

  return (
    <span
      title={names.join(", ")}
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
    >
      {names.length} {names.length === 1 ? "sede" : "sedes"}
    </span>
  );
}; // cierra const SedeCell

// ── Badge de estado ──
const StatusBadge: React.FC<{ isEnabled: boolean }> = ({ isEnabled }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      isEnabled
        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
        : "bg-slate-100 text-slate-500 border border-slate-200"
    }`}
  >
    {isEnabled ? "Activo" : "Pausado"}
  </span>
); // cierra const StatusBadge

export default AutomaticReportTable;
