// RevisionsReport.tsx
// Reporte de revisiones — diseño estilo HelpDeskReports: tarjeta de filtros con
// cabecera dorada (react-select), selector de columnas de doble lista, descargas
// Excel/PDF y previsualización de documento. La casilla "Generar en otra pestaña"
// abre además el resultado en una pestaña nueva.

import React, { useState, useEffect, useMemo } from 'react';
import { FiSearch, FiDownload, FiFileText, FiImage, FiMonitor, FiX, FiExternalLink } from 'react-icons/fi';
import PhotoGalleryViewer, { GalleryPhoto } from '../../../components/PhotoGalleryViewer';
import ReportResultTable from './ReportResultTable';
import ReportPhotoThumb from './ReportPhotoThumb';
import { useRevisionsSearch } from '../hooks/useRevisionsSearch';
import { useOpenReportResult } from '../hooks/useOpenReportResult';
import { convertTimestamp } from '../utils/reportResult';
import { parseDateInput, toDateInputValue } from '../utils/dateRange';
import { RevisionsSearchColumns } from '../adapters/getRevisionsSearchAdapter';
import useEnabledSedesForUser from '../../../components/sedesEnabled/hooks/useEnabledSedesForUser';
import { fetchSectorsBySedeIds } from '../../../components/sectorAll/hooks/fetchSectorsBySedeIds';
import useFetchCategorias from '../../CategoryChecklistCrud/hooks/useFetchCategorias';
import { useAreasBySectorId } from '../hooks/useAreasBySectorId';
import useFetchUsers from '../hooks/useFetchUsers';
import { Area } from '../../../models/Area';
import { Sector } from '../../../models/Sector';
import ColumnSelector, { ColumnOption } from '../../../components/ColumnSelector';
import ReportPreview from '../../../components/ReportPreview';
import ReportCard from '../../../components/ReportCard';
import { ReportSelect, ReportDate } from '../../../components/ReportField';
import { exportReportExcel, exportReportPdf } from '../../../components/reportExport';

const REPORT_TITLE = 'Reporte de Revisiones';

const REVISION_COLUMNS: ColumnOption[] = [
  { key: 'startDate',            label: 'Fecha de inicio' },
  { key: 'endDate',              label: 'Fecha de finalización' },
  { key: 'checklistName',        label: 'Nombre de la lista' },
  { key: 'categoryName',         label: 'Categoría' },
  { key: 'areaName',             label: 'Área' },
  { key: 'sectorName',           label: 'Sector' },
  { key: 'sedeName',             label: 'Sede' },
  { key: 'userName',             label: 'Usuario' },
  { key: 'status',               label: 'Situación' },
  { key: 'observations',         label: 'Observaciones' },
  { key: 'totalYes',             label: 'Total Sí' },
  { key: 'totalNo',              label: 'Total No' },
  { key: 'totalNa',              label: 'Total N/A' },
  { key: 'compliancePercentage', label: 'Cumplimiento (%)' },
  { key: 'photoUrl',             label: 'Fotografía' },
];

const DEFAULT_SELECTED_KEYS = ['startDate', 'endDate', 'checklistName', 'areaName', 'status', 'observations'];

const PHOTO_KEY = 'photoUrl';

// Excel escribe la foto como hipervínculo; el PDF añade una página de anexo por
// cada revisión que tenga imagen, rotulada con su fecha, lista y área.
const EXPORT_OPTIONS = {
  linkColumns: [PHOTO_KEY],
  photoAnnex: {
    sets: [{ urlKey: PHOTO_KEY, label: 'Revisión' }],
    captionKeys: ['startDate', 'checklistName', 'areaName', 'sedeName'],
  },
};

const DOWNLOAD_BTN = 'flex items-center gap-2 px-8 py-3 bg-primary-gold text-white rounded-full hover:opacity-95 disabled:opacity-40 transition-all active:scale-95 text-xs font-bold shadow-[0_4px_12px_rgba(221,152,3,0.25)]';
const WEB_BTN = 'flex items-center gap-2 px-8 py-3 bg-primary-dark text-white rounded-full hover:opacity-95 disabled:opacity-40 transition-all active:scale-95 text-xs font-bold shadow-[0_4px_12px_rgba(32,43,52,0.25)]';
const WEB_BTN_ACTIVE = 'flex items-center gap-2 px-8 py-3 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-all active:scale-95 text-xs font-bold';
const GALLERY_BTN = 'flex items-center gap-2 px-6 py-3 bg-white text-primary-gold border border-primary-gold/30 rounded-full hover:bg-primary-gold/5 transition-all active:scale-95 text-xs font-bold';
const NEW_TAB_BTN = 'flex items-center gap-2 px-8 py-3 bg-white text-primary-dark border border-primary-dark/20 rounded-full hover:bg-slate-50 disabled:opacity-40 transition-all active:scale-95 text-xs font-bold';

const RevisionsReport: React.FC = () => {
  const { data, loading, error, fetchRevisions } = useRevisionsSearch();
  const openResult = useOpenReportResult();

  const [showWebReport, setShowWebReport] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);

  const [queryParams, setQueryParams] = useState({
    startDate:  new Date(),
    endDate:    new Date(),
    sedeId:     null as string | null,
    sectorId:   null as string | null,
    areaId:     null as number | null,
    categoryId: null as string | null,
    userId:     null as string | null,
  });

  const [selected, setSelected] = useState<ColumnOption[]>(
    () => REVISION_COLUMNS.filter((c) => DEFAULT_SELECTED_KEYS.includes(c.key)),
  );
  const [available, setAvailable] = useState<ColumnOption[]>(
    () => REVISION_COLUMNS.filter((c) => !DEFAULT_SELECTED_KEYS.includes(c.key)),
  );

  const { sedes, loading: sedesLoading }     = useEnabledSedesForUser();
  const [sectors, setSectors]                = useState<Sector[]>([]);
  const [sectorsLoading, setSectorsLoading]  = useState(false);
  const { categorias, loading: catsLoading } = useFetchCategorias();
  const { areas, loading: areasLoading }     = useAreasBySectorId(queryParams.sectorId || '');
  const { users, loading: usersLoading }     = useFetchUsers();

  useEffect(() => {
    if (queryParams.sedeId) {
      setSectorsLoading(true);
      fetchSectorsBySedeIds({ sedeIds: [queryParams.sedeId] }).then((s) => {
        setSectors(s); setSectorsLoading(false);
      });
    } else { setSectors([]); }
  }, [queryParams.sedeId]);

  const patch = (fields: Partial<typeof queryParams>) => setQueryParams((prev) => ({ ...prev, ...fields }));

  const buildColumnsMap = (): RevisionsSearchColumns => {
    const map: Record<string, boolean> = {};
    REVISION_COLUMNS.forEach((c) => { map[c.key] = selected.some((s) => s.key === c.key); });
    return map as unknown as RevisionsSearchColumns;
  };

  const handleSearch = () => {
    setShowWebReport(false);
    fetchRevisions(queryParams, buildColumnsMap());
  };

  const handleClear = () => {
    setQueryParams({
      startDate: new Date(), endDate: new Date(),
      sedeId: null, sectorId: null, areaId: null, categoryId: null, userId: null,
    });
    setSectors([]);
  };

  const handleColumnChange = (avail: ColumnOption[], sel: ColumnOption[]) => {
    setAvailable(avail);
    setSelected(sel);
  };

  // Estabilizado con useMemo: `data ?? []` crearía un array nuevo en cada render
  // e invalidaría los useMemo que dependen de él.
  const rows = useMemo(() => data ?? [], [data]);
  const hasResults = rows.length > 0;

  // Fotografías de las revisiones del resultado, con su contexto para la galería.
  const photos = useMemo<GalleryPhoto[]>(
    () =>
      (rows as Record<string, any>[])
        .filter((r) => typeof r[PHOTO_KEY] === 'string' && r[PHOTO_KEY])
        .map((r) => ({
          url: r[PHOTO_KEY],
          title: r.checklistName || REPORT_TITLE,
          meta: [convertTimestamp(r.startDate), r.areaName, r.sedeName].filter(Boolean).join(' · '),
        })),
    [rows],
  );

  const photoIndexOf = (url: string) => photos.findIndex((p) => p.url === url);
  const photoColumnIndex = selected.findIndex((c) => c.key === PHOTO_KEY);

  // Matriz normalizada para el reporte web (mismas columnas que el usuario eligió).
  const webRows = useMemo(
    () => (rows as Record<string, any>[]).map((r) => selected.map((c) => convertTimestamp(r[c.key]))),
    [rows, selected],
  );

  // Mismo resultado que el reporte web, servido en una pestaña nueva.
  const handleOpenInNewTab = () => {
    openResult(
      Promise.resolve({
        title: REPORT_TITLE,
        subtitle: 'Pristine · Auditoría de Checklists',
        headers: selected.map((c) => c.label),
        rows: webRows,
        photoColumnIndex: photoColumnIndex >= 0 ? photoColumnIndex : undefined,
        photos,
      }),
    );
  };

  return (
    <div className="space-y-6">
      {/* Grid: filtros + columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Filtros (cabecera dorada) */}
        <ReportCard title="Filtros de búsqueda" className="lg:col-span-1 h-full" bodyClassName="flex flex-col justify-between space-y-4">
          <div className="space-y-3.5">
            <ReportSelect
              label="Sede" isLoading={sedesLoading}
              options={sedes.map((s) => ({ value: s.id, label: s.name }))}
              value={queryParams.sedeId || ''}
              onChange={(v) => patch({ sedeId: v || null, sectorId: null, areaId: null })}
            />
            <ReportSelect
              label="Sector" isLoading={sectorsLoading} isDisabled={!queryParams.sedeId}
              options={sectors.map((s) => ({ value: s.id, label: s.name }))}
              value={queryParams.sectorId || ''}
              onChange={(v) => patch({ sectorId: v || null, areaId: null })}
            />
            <ReportSelect
              label="Área" isLoading={areasLoading} isDisabled={!queryParams.sectorId}
              options={areas.map((a: Area) => ({ value: String(a.area_id), label: `${a.area_id} — ${a.name}` }))}
              value={queryParams.areaId != null ? String(queryParams.areaId) : ''}
              onChange={(v) => patch({ areaId: v ? Number(v) : null })}
            />
            <ReportSelect
              label="Categoría" isLoading={catsLoading}
              options={categorias.map((c) => ({ value: c.id, label: c.name }))}
              value={queryParams.categoryId || ''}
              onChange={(v) => patch({ categoryId: v || null })}
            />
            <ReportSelect
              label="Usuario" isLoading={usersLoading}
              options={users.map((u) => ({ value: u.id, label: u.name }))}
              value={queryParams.userId || ''}
              onChange={(v) => patch({ userId: v || null })}
            />
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Fechas</label>
              <div className="grid grid-cols-2 gap-2">
                <ReportDate value={toDateInputValue(queryParams.startDate)} onChange={(v) => patch({ startDate: parseDateInput(v) })} />
                <ReportDate value={toDateInputValue(queryParams.endDate)} onChange={(v) => patch({ endDate: parseDateInput(v) })} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-neutral-100 flex-shrink-0">
            <button
              type="button"
              onClick={handleClear}
              className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-all active:scale-95"
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={handleSearch}
              disabled={loading}
              className="w-full py-2.5 text-xs font-bold text-white bg-primary-gold hover:opacity-95 rounded-full transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(221,152,3,0.25)] disabled:opacity-40"
            >
              <FiSearch className="w-3.5 h-3.5" />
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </ReportCard>

        {/* Columnas + descargas */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="flex-1">
            <ColumnSelector available={available} selected={selected} onChange={handleColumnChange} />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 mt-4">
            {photos.length > 0 && (
              <button type="button" onClick={() => setGalleryIndex(0)} className={GALLERY_BTN}>
                <FiImage className="w-4 h-4" />
                Ver galería ({photos.length})
              </button>
            )}
            <button
              type="button"
              disabled={!hasResults}
              onClick={() => setShowWebReport((v) => !v)}
              className={showWebReport ? WEB_BTN_ACTIVE : WEB_BTN}
            >
              {showWebReport ? <FiX className="w-4 h-4" /> : <FiMonitor className="w-4 h-4" />}
              {showWebReport ? 'Ocultar reporte web' : 'Generar en web'}
            </button>
            <button type="button" disabled={!hasResults} onClick={handleOpenInNewTab} className={NEW_TAB_BTN}>
              <FiExternalLink className="w-4 h-4" />
              Generar en otra pestaña
            </button>
            <button type="button" disabled={!hasResults} onClick={() => exportReportExcel(REPORT_TITLE, rows, selected, EXPORT_OPTIONS)} className={DOWNLOAD_BTN}>
              <FiDownload className="w-4 h-4" />
              Descargar Excel
            </button>
            <button type="button" disabled={!hasResults} onClick={() => exportReportPdf(REPORT_TITLE, rows, selected, EXPORT_OPTIONS)} className={DOWNLOAD_BTN}>
              <FiFileText className="w-4 h-4" />
              Descargar PDF
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-danger-200/30 border border-danger-200 text-danger-700 rounded-2xl text-center text-xs font-semibold">
          Error al generar el reporte: {error}
        </div>
      )}

      {/* Reporte web: resultado completo dentro de la propia página */}
      {showWebReport && hasResults && (
        <div className="bg-white border border-neutral-100 rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6 md:p-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FiMonitor className="w-5 h-5 text-primary-gold" />
                {REPORT_TITLE}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Pristine · Auditoría de Checklists · {rows.length} resultado{rows.length !== 1 ? 's' : ''} · Generado el{' '}
                {new Date().toLocaleString('es-GT')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowWebReport(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors shrink-0"
            >
              Ocultar
            </button>
          </div>

          <ReportResultTable
            headers={selected.map((c) => c.label)}
            rows={webRows}
            renderCell={(value, _rowIndex, colIndex) =>
              colIndex === photoColumnIndex
                ? <ReportPhotoThumb url={typeof value === 'string' ? value : null} onOpen={(url) => setGalleryIndex(photoIndexOf(url))} />
                : undefined
            }
          />
        </div>
      )}

      {/* Previsualización de documento */}
      <div className="bg-white border border-neutral-100 rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6 md:p-8">
        <ReportPreview
          title={REPORT_TITLE}
          subtitle="Pristine · Auditoría de Checklists"
          results={rows}
          selectedColumns={selected}
          loading={loading}
          renderCell={(row, column) =>
            column.key === PHOTO_KEY
              ? <ReportPhotoThumb url={row[PHOTO_KEY]} onOpen={(url) => setGalleryIndex(photoIndexOf(url))} />
              : undefined
          }
        />
      </div>

      <PhotoGalleryViewer
        photos={photos}
        index={galleryIndex}
        onIndexChange={setGalleryIndex}
        onClose={() => setGalleryIndex(null)}
      />
    </div>
  );
};

export default RevisionsReport;
