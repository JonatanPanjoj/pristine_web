import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch,
  FiX,
  FiFilter,
  FiChevronDown,
  FiChevronUp,
  FiChevronLeft,
  FiChevronRight,
  FiGrid,
  FiDownload,
  FiLayers,
} from 'react-icons/fi';
import { BsQrCode, BsFilePdf } from 'react-icons/bs';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

import useEnabledSedesForUser from '../../../components/sedesEnabled/hooks/useEnabledSedesForUser';
import { fetchSectorsBySedeIds } from '../../../components/sectorAll/hooks/fetchSectorsBySedeIds';
import { Sector } from '../../../models/Sector';
import useFetchAreas from '../hooks/useFetchAreas';
import getSedeNameBySectorId from '../hooks/getSedeNameBySectorId';
import { fetchSectorName } from '../hooks/fetchSectorName';
import { formatAreaCode } from '../utils/areaCode';

import FormModal from '../../../components/FormModal';
import SingleQRCard from '../components/SingleQRCard';
import QRActionBar from '../components/QRActionBar';
import { AreaItemData } from '../components/AreaItemCard';

const AnimatePresenceComponent: any = AnimatePresence;

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.05 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

const CodeBadge: React.FC<{ code: number }> = ({ code }) => (
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
    {formatAreaCode(code)}
  </span>
);

export const AreaQRView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFields, setSearchFields] = useState<{ name?: string }>({});
  const [selectedSedeId, setSelectedSedeId] = useState<string | null>(null);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const [pageSize, setPageSize] = useState(10);
  const { sedes, loading: sedesLoading } = useEnabledSedesForUser();

  const sedeIds = React.useMemo(() => {
    return selectedSedeId ? [selectedSedeId] : sedes.map((sede) => sede.id);
  }, [selectedSedeId, sedes]);

  const sectorIds = React.useMemo(() => {
    return selectedSectorId ? [selectedSectorId] : sectors.map((s) => s.id);
  }, [selectedSectorId, sectors]);

  const prevSedeIdsRef = useRef<string[]>([]);

  const { areas, loading: areasLoading, error, loadPage, currentPage, totalPages, totalDocs } = useFetchAreas({
    pageSize,
    searchFields,
    sectorIds,
  });

  const [localAreas, setLocalAreas] = useState<AreaItemData[]>([]);
  const [selectedItemsMap, setSelectedItemsMap] = useState<Record<string, AreaItemData>>({});
  const [activeModalItem, setActiveModalItem] = useState<AreaItemData | null>(null);

  useEffect(() => {
    const areSedeIdsEqual = (arr1: string[], arr2: string[]) => {
      if (arr1.length !== arr2.length) return false;
      return arr1.every((id, index) => id === arr2[index]);
    };

    if (!areSedeIdsEqual(prevSedeIdsRef.current, sedeIds)) {
      const loadSectors = async () => {
        const loadedSectors = await fetchSectorsBySedeIds({ sedeIds });
        setSectors(loadedSectors);
      };

      if (sedeIds.length > 0) {
        loadSectors();
        prevSedeIdsRef.current = sedeIds;
      }
    }
  }, [sedeIds]);

  useEffect(() => {
    let isMounted = true;

    const fetchNames = async () => {
      if (areas.length === 0) {
        if (isMounted) {
          setLocalAreas([]);
        }
        return;
      }

      const initialItems: AreaItemData[] = areas.map((area: any) => {
        const matchingSede = sedes.find(
          (s) => s.id === area.SedeId || s.id === area.sede_id || s.sede_id === area.SedeId
        );
        return {
          id: area.id,
          area_id: area.area_id,
          name: area.name,
          level: area.level,
          sedeName: area.sedeName || matchingSede?.name || null,
          sectorName: area.sectorName || null,
          sedePhoto: matchingSede?.url_photo || null,
        };
      });

      const filteredInitial = selectedLevel
        ? initialItems.filter((a) => String(a.level) === String(selectedLevel))
        : initialItems;

      if (isMounted) setLocalAreas(filteredInitial);

      const areasWithNames = await Promise.all(
        areas.map(async (area: any) => {
          const matchingSede = sedes.find(
            (s) => s.id === area.SedeId || s.id === area.sede_id || s.sede_id === area.SedeId
          );
          const sedeName = matchingSede?.name || (await getSedeNameBySectorId(area.SedeId));
          const sectorName = await fetchSectorName(area.SectorId);
          const sedePhoto = matchingSede?.url_photo || null;
          return {
            id: area.id,
            area_id: area.area_id,
            name: area.name,
            level: area.level,
            sedeName,
            sectorName,
            sedePhoto,
          };
        })
      );

      if (isMounted) {
        const filtered = selectedLevel
          ? areasWithNames.filter((a) => String(a.level) === String(selectedLevel))
          : areasWithNames;
        setLocalAreas(filtered);
      }
    };

    fetchNames();

    return () => {
      isMounted = false;
    };
  }, [areas, selectedLevel, sedes]);

  const handleSearch = () => {
    setSearchFields(searchTerm.trim() ? { name: searchTerm.trim() } : {});
  };

  const handleToggleSelect = (item: AreaItemData) => {
    setSelectedItemsMap((prev) => {
      const next = { ...prev };
      if (next[item.id]) {
        delete next[item.id];
      } else {
        next[item.id] = item;
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    const next = { ...selectedItemsMap };
    localAreas.forEach((item) => {
      next[item.id] = item;
    });
    setSelectedItemsMap(next);
  };

  const handleClearSelection = () => {
    setSelectedItemsMap({});
  };

  const handleDownloadSinglePdf = async (item: AreaItemData) => {
    try {
      const element = document.getElementById(`single-card-${item.id}`);
      if (!element) return;
      const canvas = await html2canvas(element, { scale: 3, backgroundColor: '#ffffff' });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const SINGLE_LABEL_WIDTH = 150;
      const PAGE_WIDTH = 210;
      const PAGE_HEIGHT = 297;
      const MARGIN = 10;
      const height = (canvas.height * SINGLE_LABEL_WIDTH) / canvas.width;
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        (PAGE_WIDTH - SINGLE_LABEL_WIDTH) / 2,
        Math.max(MARGIN, (PAGE_HEIGHT - height) / 2),
        SINGLE_LABEL_WIDTH,
        height
      );
      pdf.save(`etiqueta-${item.area_id}-${item.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`);
    } catch (err) {
      console.error('Error al generar PDF individual:', err);
    }
  };

  const handleDownloadSinglePng = async (item: AreaItemData) => {
    try {
      const element = document.getElementById(`single-card-${item.id}`);
      if (!element) return;
      const canvas = await html2canvas(element, { scale: 3, backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.download = `qr_${item.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${item.area_id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Error al descargar PNG individual:', err);
    }
  };

  const selectedList = Object.values(selectedItemsMap);
  const isAllSelected = localAreas.length > 0 && localAreas.every((item) => !!selectedItemsMap[item.id]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage !== currentPage) loadPage(newPage);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-12 select-none"
    >
      {/* 1. Encabezado Superior (Header Card) */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] px-6 py-6 md:px-8 md:py-6 border-0"
      >
        <div className="flex items-center gap-3">
          <div className="p-3.5 bg-amber-50 rounded-2xl text-primary-gold shadow-sm shrink-0">
            <FiGrid className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Impresión de Código QR
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Genera, visualiza e imprime códigos QR para el escaneo de ubicaciones físicas.
            </p>
          </div>
        </div>
      </motion.div>

      {/* 2. Tarjeta Principal de la Tabla */}
      <motion.div
        variants={cardVariants}
        className="relative bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6 md:p-8 flex flex-col flex-1 min-h-0 border-0"
      >
        {error && (
          <div className="mb-4 px-4 py-2 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600 font-medium">
            {error}
          </div>
        )}

        {/* Fila Superior de Controles */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 mt-1 flex-shrink-0">
          {/* Limitador de Registros + Filtros Toggle */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
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
              <span>por página</span>
            </div>

            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <FiFilter className="w-3.5 h-3.5" />
              <span>Filtros</span>
              {showFilters ? <FiChevronUp className="w-3.5 h-3.5" /> : <FiChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Buscador + Controles Seleccionar todas / Limpiar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all"
              >
                Seleccionar todas
              </button>
              <button
                type="button"
                onClick={handleClearSelection}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors px-2 py-1.5"
              >
                Limpiar selección ({selectedList.length})
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por nombre..."
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
                    setSearchFields({});
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Panel Desplegable de Filtros */}
        <AnimatePresenceComponent>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 pt-2 pb-4 border-y border-slate-100 overflow-hidden"
            >
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Sede</label>
                <select
                  value={selectedSedeId || ''}
                  onChange={(e) => {
                    setSelectedSedeId(e.target.value || null);
                    setSelectedSectorId(null);
                  }}
                  disabled={sedesLoading}
                  className="w-full bg-slate-100/80 border-0 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-gold/40 cursor-pointer"
                >
                  <option value="">Todas</option>
                  {sedes.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Sector</label>
                <select
                  value={selectedSectorId || ''}
                  onChange={(e) => setSelectedSectorId(e.target.value || null)}
                  className="w-full bg-slate-100/80 border-0 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-gold/40 cursor-pointer"
                >
                  <option value="">Todas</option>
                  {sectors.map((sec) => (
                    <option key={sec.id} value={sec.id}>{sec.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Nivel</label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full bg-slate-100/80 border-0 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-gold/40 cursor-pointer"
                >
                  <option value="">Todas</option>
                  <option value="1">Nivel 1</option>
                  <option value="2">Nivel 2</option>
                  <option value="3">Nivel 3</option>
                  <option value="4">Nivel 4</option>
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresenceComponent>

        {/* Tabla de Áreas */}
        <div className="flex-1 overflow-auto min-h-0 scrollbar-none">
          <table className="w-full border-separate border-spacing-y-4 text-center">
            <thead>
              <tr className="text-white text-xs font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3 bg-primary-gold first:rounded-l-full w-12 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={() => {
                      if (isAllSelected) handleClearSelection();
                      else handleSelectAll();
                    }}
                    className="w-4 h-4 rounded border-slate-300 text-slate-800 focus:ring-slate-800 cursor-pointer accent-slate-800"
                    title={isAllSelected ? "Deseleccionar todas" : "Seleccionar todas"}
                  />
                </th>
                <th className="py-2.5 px-4 bg-primary-gold">Código</th>
                <th className="py-2.5 px-4 bg-primary-gold text-left">Nombre del Área</th>
                <th className="py-2.5 px-4 bg-primary-gold">Sede</th>
                <th className="py-2.5 px-4 bg-primary-gold">Sector</th>
                <th className="py-2.5 px-4 bg-primary-gold">Nivel</th>
                <th className="py-2.5 px-4 bg-primary-gold last:rounded-r-full">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {areasLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td
                        key={j}
                        className="py-3 px-4 bg-[#FAFAFA] first:rounded-l-full last:rounded-r-full"
                      >
                        <div className="h-4 bg-neutral-200 rounded w-16 mx-auto" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : localAreas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-sm font-medium">
                    <FiLayers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No se encontraron áreas
                  </td>
                </tr>
              ) : (
                localAreas.map((row) => {
                  const isSelected = !!selectedItemsMap[row.id];
                  return (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`transition-all group ${
                        isSelected
                          ? 'shadow-[0_4px_16px_rgba(252,181,33,0.12)]'
                          : 'hover:shadow-[0_4px_12px_rgba(0,0,0,0.02)]'
                      }`}
                    >
                      {/* Checkbox de Selección Fila */}
                      <td className={`py-3 px-3 first:rounded-l-full transition-colors ${isSelected ? 'bg-amber-50/60' : 'bg-[#FAFAFA]'}`}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(row)}
                          className="w-4 h-4 rounded border-slate-300 text-primary-gold focus:ring-primary-gold/40 cursor-pointer"
                        />
                      </td>

                      {/* Código Badge */}
                      <td className={`py-3 px-4 transition-colors ${isSelected ? 'bg-amber-50/60' : 'bg-[#FAFAFA]'}`}>
                        <CodeBadge code={row.area_id} />
                      </td>

                      {/* Nombre del Área */}
                      <td className={`py-3 px-4 text-left transition-colors ${isSelected ? 'bg-amber-50/60' : 'bg-[#FAFAFA]'}`}>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary-gold/15 text-primary-gold flex items-center justify-center text-xs font-bold shrink-0">
                            {row.name?.charAt(0)?.toUpperCase() ?? '?'}
                          </div>
                          <span className="text-slate-800 text-sm font-bold truncate max-w-[220px]">
                            {row.name}
                          </span>
                        </div>
                      </td>

                      {/* Sede */}
                      <td className={`py-3 px-4 text-xs text-slate-600 font-semibold transition-colors ${isSelected ? 'bg-amber-50/60' : 'bg-[#FAFAFA]'}`}>
                        {row.sedeName || '—'}
                      </td>

                      {/* Sector */}
                      <td className={`py-3 px-4 text-xs text-slate-600 font-semibold transition-colors ${isSelected ? 'bg-amber-50/60' : 'bg-[#FAFAFA]'}`}>
                        {row.sectorName || '—'}
                      </td>

                      {/* Nivel */}
                      <td className={`py-3 px-4 transition-colors ${isSelected ? 'bg-amber-50/60' : 'bg-[#FAFAFA]'}`}>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                          Nivel {row.level ?? 1}
                        </span>
                      </td>

                      {/* Acciones (Popup QR & Descargar PDF) */}
                      <td className={`py-3 px-4 last:rounded-r-full transition-colors ${isSelected ? 'bg-amber-50/60' : 'bg-[#FAFAFA]'}`}>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setActiveModalItem(row)}
                            title="Visualizar QR en Popup"
                            className="w-7 h-7 rounded-lg bg-primary-gold text-white flex items-center justify-center hover:opacity-90 transition-all active:scale-95 shadow-sm"
                          >
                            <BsQrCode className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDownloadSinglePdf(row)}
                            title="Descargar PDF (Hoja completa)"
                            className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center hover:bg-slate-900 transition-all active:scale-95 shadow-sm"
                          >
                            <BsFilePdf className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
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
              : '0 resultados'}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || areasLoading}
              className="w-9 h-9 rounded-full bg-primary-gold text-white flex items-center justify-center shadow-md hover:opacity-95 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <FiChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <div className="w-9 h-9 rounded-full bg-primary-gold text-white flex items-center justify-center font-bold text-sm shadow-md select-none">
              {currentPage}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || areasLoading}
              className="w-9 h-9 rounded-full bg-primary-gold text-white flex items-center justify-center shadow-md hover:opacity-95 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <FiChevronRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* 3. Barra Inferior de Acciones Generales */}
      <motion.div variants={cardVariants}>
        <QRActionBar selectedItems={selectedList} onSelectAll={handleSelectAll} />
      </motion.div>

      {/* Modal Popup para Visualización Individual del QR */}
      <FormModal
        isOpen={!!activeModalItem}
        onClose={() => setActiveModalItem(null)}
        maxWidth="max-w-md"
      >
        {activeModalItem && (
          <div className="p-6 text-center space-y-5 select-none">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800">
                Código QR de Ubicación
              </h3>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl flex justify-center border border-slate-100">
              <SingleQRCard item={activeModalItem} width={280} />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => handleDownloadSinglePdf(activeModalItem)}
                className="w-full sm:w-auto px-5 py-2.5 bg-primary-gold hover:opacity-90 text-white rounded-full font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
              >
                <BsFilePdf className="w-4 h-4" />
                Descargar PDF (Hoja completa)
              </button>
              <button
                type="button"
                onClick={() => handleDownloadSinglePng(activeModalItem)}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <FiDownload className="w-4 h-4" />
                Descargar PNG
              </button>
            </div>
          </div>
        )}
      </FormModal>

      {/* Contenedor Oculto en UI para Renderizado de PDF e Imágenes */}
      <div
        id="printable-single-qr-container"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 0,
          width: '100%',
        }}
      >
        {localAreas.map((item) => (
          <div
            key={item.id}
            className="print-single-page p-8 flex items-center justify-center min-h-screen bg-white"
          >
            <SingleQRCard id={`single-card-${item.id}`} item={item} />
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default AreaQRView;