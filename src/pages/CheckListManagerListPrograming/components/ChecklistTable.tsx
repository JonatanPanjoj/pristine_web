import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import fetchCategorias from '../../../components/CategoryChecklist/hooks/fetchCategorias';
import useFetchChecklists from '../hooks/useFetchChecklists';
import { useToggleChecklistStatus } from '../hooks/useToggleChecklistStatus';
import Loader from '../../../components/Loader';
import ConfirmationModal from '../../../components/ConfirmationModal';
import { ExitoCard } from '../../../components/ExitoCard';
import ChecklistCard from './ChecklistCard';
import ChecklistDetailModal from './ChecklistDetailModal';
import { Checklist } from '../../../models/Checklist';
import { useChecklistsSchedules } from '../hooks/useChecklistsSchedules';

export interface ChecklistTableHandle {
  refresh: () => void;
}

interface ChecklistTableProps {
  searchFields?: Partial<{ name: string }>;
  searchTrigger?: number;
}

const ChecklistTable = forwardRef<ChecklistTableHandle, ChecklistTableProps>(
  ({ searchFields }, ref) => {

  const {
    checklists, loading, error,
    loadPage, currentPage, totalPages, totalDocs,
    refresh,
  } = useFetchChecklists({ pageSize: 9, searchFields });

  const { schedulesMap, refresh: refreshSchedules } = useChecklistsSchedules(checklists ?? []);
  const { toggleStatus, loading: toggleLoading, error: toggleError } = useToggleChecklistStatus();

  const [categories,          setCategories]          = useState<{ id: string; name: string }[]>([]);
  const [selectedChecklist,   setSelectedChecklist]   = useState<Checklist | null>(null);

  // ── Modal unificado de edición (General + Preguntas + Schedule) ───────────
  const [showDetailModal,     setShowDetailModal]     = useState(false);
  const [detailChecklistId,   setDetailChecklistId]   = useState<string | null>(null);
  const [detailChecklistName, setDetailChecklistName] = useState<string>('');

  const [showExitoCard,  setShowExitoCard]  = useState(false);
  const [exitoMessage,   setExitoMessage]   = useState('');
  const [exitoSuccess,   setExitoSuccess]   = useState(true);
  const [confirmOpen,    setConfirmOpen]    = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    refresh: () => {
      refresh();
      refreshSchedules();
    },
  }), [refresh, refreshSchedules]);

  useEffect(() => {
    fetchCategorias().then(({ categorias, error }) => {
      if (!error && categorias) setCategories(categorias);
    });
  }, []);

  const handleEdit = (cl: Checklist) => {
    setSelectedChecklist(cl);
    setDetailChecklistId(cl.id);
    setDetailChecklistName(cl.name);
    setShowDetailModal(true);
  };

  const handleDelete = (id: string) => {
    setDeleteTargetId(id);
    setConfirmOpen(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setDetailChecklistId(null);
    setSelectedChecklist(null);
    refresh();
    refreshSchedules();
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await toggleStatus(deleteTargetId);
      setExitoMessage('Checklist eliminado con éxito.');
      setExitoSuccess(true);
      refresh();
    } catch {
      setExitoMessage('Error al eliminar el checklist.');
      setExitoSuccess(false);
    } finally {
      setShowExitoCard(true);
      setConfirmOpen(false);
    }
  };

  const handlePageChange = (p: number) => {
    if (p >= 1 && p !== currentPage) loadPage(p);
  };

  return (
    <div className="relative">

      {toggleLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 rounded-2xl">
          <Loader />
        </div>
      )}

      {(error || toggleError) && (
        <div className="mb-4 px-4 py-2 rounded-2xl bg-danger-200/20 border border-danger-200 text-sm text-danger-700">
          {error || toggleError}
        </div>
      )}

      <ChecklistCard
        checklists={checklists ?? []}
        categories={categories}
        schedulesMap={schedulesMap}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 flex-wrap gap-3">
          <span className="text-xs text-slate-400 font-medium">
            Página {currentPage} de {totalPages} · {totalDocs} checklists
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-primary-gold text-white shadow-md hover:opacity-95 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FiChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-9 h-9 rounded-full text-sm font-bold transition-all active:scale-95 ${
                  currentPage === page
                    ? 'bg-primary-gold text-white shadow-md'
                    : 'bg-white text-slate-500 hover:bg-slate-100'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-primary-gold text-white shadow-md hover:opacity-95 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FiChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Modal unificado de Edición (Información General + Preguntas + Schedule) */}
      {showDetailModal && detailChecklistId && (
        <ChecklistDetailModal
          checklistId={detailChecklistId}
          checklistName={detailChecklistName}
          checklist={selectedChecklist ?? undefined}
          initialTab="general"
          onClose={closeDetailModal}
          onSaved={() => {
            refresh();
            refreshSchedules();
          }}
        />
      )}

      <ConfirmationModal
        isOpen={confirmOpen}
        message="¿Estás seguro de que quieres eliminar este checklist?"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
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
});

ChecklistTable.displayName = 'ChecklistTable';
export default ChecklistTable;
