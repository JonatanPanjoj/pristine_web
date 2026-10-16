// ListReport.tsx
// Reporte de listas de chequeo — diseño estilo HelpDeskReports: tarjeta de filtros
// con cabecera dorada, selector de columnas de doble lista, descargas Excel/PDF y
// previsualización. La casilla "Generar en otra pestaña" abre además el resultado
// en una pestaña nueva.

import React, { useState, useEffect } from 'react';
import { FiSearch, FiDownload, FiFileText, FiExternalLink } from 'react-icons/fi';
import { useChecklistsSearch } from '../hooks/useChecklistsSearch';
import { useOpenReportResult } from '../hooks/useOpenReportResult';
import { convertTimestamp } from '../utils/reportResult';
import { ChecklistsSearchColumns } from '../adapters/getChecklistsSearchAdapter';
import { ChecklistSchedule } from '../../../models/ChecklistSchedule';
import useEnabledSedesForUser from '../../../components/sedesEnabled/hooks/useEnabledSedesForUser';
import { fetchSectorsBySedeIds } from '../../../components/sectorAll/hooks/fetchSectorsBySedeIds';
import useFetchCategorias from '../../CategoryChecklistCrud/hooks/useFetchCategorias';
import { Sector } from '../../../models/Sector';
import ColumnSelector, { ColumnOption } from '../../../components/ColumnSelector';
import ReportPreview from '../../../components/ReportPreview';
import ReportCard from '../../../components/ReportCard';
import { ReportSelect, SelectOption } from '../../../components/ReportField';
import { exportReportExcel, exportReportPdf } from '../../../components/reportExport';

type DayKey = keyof ChecklistSchedule['activeDays'];

const REPORT_TITLE = 'Reporte de Listas';

const DAY_OPTIONS: SelectOption[] = [
  { value: 'monday',    label: 'Lunes' },
  { value: 'tuesday',   label: 'Martes' },
  { value: 'wednesday', label: 'Miércoles' },
  { value: 'thursday',  label: 'Jueves' },
  { value: 'friday',    label: 'Viernes' },
  { value: 'saturday',  label: 'Sábado' },
  { value: 'sunday',    label: 'Domingo' },
];

const SITUATION_OPTIONS: SelectOption[] = [
  { value: 'active',   label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
];

const LIST_COLUMNS: ColumnOption[] = [
  { key: 'checklistName',        label: 'Nombre de la lista' },
  { key: 'checklistCode',        label: 'Código de lista' },
  { key: 'scheduledDays',        label: 'Días programados' },
  { key: 'timeRange',            label: 'Intervalo de horarios' },
  { key: 'sedeName',             label: 'Sede' },
  { key: 'requiresPhoto',        label: '¿Requiere foto?' },
  { key: 'requiresFirm',         label: '¿Requiere firma?' },
  { key: 'scheduleObservations', label: 'Observaciones de la lista' },
  { key: 'categoryCode',         label: 'Código de categoría' },
  { key: 'categoryName',         label: 'Categoría' },
  { key: 'categoryColor',        label: 'Color de categoría' },
  { key: 'areaCode',             label: 'Código de área' },
  { key: 'areaLevel',            label: 'Nivel de área' },
  { key: 'areaName',             label: 'Área' },
  { key: 'sectorCode',           label: 'Código de sector' },
  { key: 'sectorName',           label: 'Sector' },
  { key: 'sedeCode',             label: 'Código de sede' },
  { key: 'scheduleCode',         label: 'Código de programación' },
];

const DEFAULT_SELECTED_KEYS = ['checklistName', 'checklistCode', 'scheduledDays', 'timeRange', 'sedeName'];

const DOWNLOAD_BTN = 'flex items-center gap-2 px-8 py-3 bg-primary-gold text-white rounded-full hover:opacity-95 disabled:opacity-40 transition-all active:scale-95 text-xs font-bold shadow-[0_4px_12px_rgba(221,152,3,0.25)]';

const ListReport: React.FC = () => {
  const { data, loading, error, fetchChecklists } = useChecklistsSearch();
  const openResult = useOpenReportResult();


  const [queryParams, setQueryParams] = useState({
    sedeId:     null as string | null,
    sectorId:   null as string | null,
    areaId:     null as number | null,
    categoryId: null as string | null,
    dayOfWeek:  null as DayKey | null,
    isEnabled:  null as boolean | null,
  });

  const [selected, setSelected] = useState<ColumnOption[]>(
    () => LIST_COLUMNS.filter((c) => DEFAULT_SELECTED_KEYS.includes(c.key)),
  );
  const [available, setAvailable] = useState<ColumnOption[]>(
    () => LIST_COLUMNS.filter((c) => !DEFAULT_SELECTED_KEYS.includes(c.key)),
  );

  const { sedes, loading: sedesLoading }     = useEnabledSedesForUser();
  const [sectors, setSectors]                = useState<Sector[]>([]);
  const [sectorsLoading, setSectorsLoading]  = useState(false);
  const { categorias, loading: catsLoading } = useFetchCategorias();

  useEffect(() => {
    if (queryParams.sedeId) {
      setSectorsLoading(true);
      fetchSectorsBySedeIds({ sedeIds: [queryParams.sedeId] }).then((s) => {
        setSectors(s); setSectorsLoading(false);
      });
    } else { setSectors([]); }
  }, [queryParams.sedeId]);

  const patch = (fields: Partial<typeof queryParams>) => setQueryParams((prev) => ({ ...prev, ...fields }));

  const buildColumnsMap = (): ChecklistsSearchColumns => {
    const map: Record<string, boolean> = {};
    LIST_COLUMNS.forEach((c) => { map[c.key] = selected.some((s) => s.key === c.key); });
    return map as unknown as ChecklistsSearchColumns;
  };

  const handleSearch = () => fetchChecklists(queryParams, buildColumnsMap());

  /** Lleva el resultado a su propia página, sin tocar la previsualización. */
  const handleWebView = () => {
    openResult(
      fetchChecklists(queryParams, buildColumnsMap()).then((rows) => ({
        title: REPORT_TITLE,
        headers: selected.map((c) => c.label),
        rows: (rows as Record<string, any>[]).map((r) => selected.map((c) => convertTimestamp(r[c.key]))),
      })),
    );
  };

  const handleClear = () => {
    setQueryParams({ sedeId: null, sectorId: null, areaId: null, categoryId: null, dayOfWeek: null, isEnabled: null });
    setSectors([]);
  };

  const handleColumnChange = (avail: ColumnOption[], sel: ColumnOption[]) => {
    setAvailable(avail);
    setSelected(sel);
  };

  const situationValue = queryParams.isEnabled === null ? '' : queryParams.isEnabled ? 'active' : 'inactive';
  const rows = data ?? [];
  const hasResults = rows.length > 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Filtros */}
        <ReportCard title="Filtros de búsqueda" className="lg:col-span-1 h-full" bodyClassName="flex flex-col justify-between space-y-4">
          <div className="space-y-3.5">
            <ReportSelect
              label="Sede" isLoading={sedesLoading}
              options={sedes.map((s) => ({ value: s.id, label: s.name }))}
              value={queryParams.sedeId || ''}
              onChange={(v) => patch({ sedeId: v || null, sectorId: null })}
            />
            <ReportSelect
              label="Sector" isLoading={sectorsLoading} isDisabled={!queryParams.sedeId}
              options={sectors.map((s) => ({ value: s.id, label: s.name }))}
              value={queryParams.sectorId || ''}
              onChange={(v) => patch({ sectorId: v || null })}
            />
            <ReportSelect
              label="Categoría" isLoading={catsLoading}
              options={categorias.map((c) => ({ value: c.id, label: c.name }))}
              value={queryParams.categoryId || ''}
              onChange={(v) => patch({ categoryId: v || null })}
            />
            <ReportSelect
              label="Día hábil"
              options={DAY_OPTIONS}
              value={queryParams.dayOfWeek || ''}
              onChange={(v) => patch({ dayOfWeek: (v as DayKey) || null })}
            />
            <ReportSelect
              label="Situación"
              options={SITUATION_OPTIONS}
              value={situationValue}
              onChange={(v) => patch({ isEnabled: v === '' ? null : v === 'active' })}
            />
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
            <button type="button" onClick={handleWebView} className={DOWNLOAD_BTN}>
              <FiExternalLink className="w-4 h-4" />
              Ver en web
            </button>
            <button type="button" disabled={!hasResults} onClick={() => exportReportExcel(REPORT_TITLE, rows, selected)} className={DOWNLOAD_BTN}>
              <FiDownload className="w-4 h-4" />
              Descargar Excel
            </button>
            <button type="button" disabled={!hasResults} onClick={() => exportReportPdf(REPORT_TITLE, rows, selected)} className={DOWNLOAD_BTN}>
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

      {/* Previsualización */}
      <div className="bg-white border border-neutral-100 rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6 md:p-8">
        <ReportPreview
          title={REPORT_TITLE}
          subtitle="Pristine · Listas de Chequeo"
          results={rows}
          selectedColumns={selected}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default ListReport;
