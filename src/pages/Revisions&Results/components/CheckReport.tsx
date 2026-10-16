// CheckReport.tsx
// Reporte de cumplimiento de programaciones — diseño estilo HelpDeskReports:
// tarjeta de filtros con cabecera dorada y previsualización. Columnas fijas.
// Conserva la exportación PDF/Excel con promedio. La casilla "Generar en otra
// pestaña" abre el resultado en una pestaña nueva (usa fetchDirect).

import React, { useState, useEffect } from 'react';
import { FiSearch, FiDownload, FiFileText, FiExternalLink } from 'react-icons/fi';
import useEnabledSedesForUser from '../../../components/sedesEnabled/hooks/useEnabledSedesForUser';
import { fetchSectorsBySedeIds } from '../../../components/sectorAll/hooks/fetchSectorsBySedeIds';
import useFetchCategorias from '../../CategoryChecklistCrud/hooks/useFetchCategorias';
import { useAreasBySectorId } from '../hooks/useAreasBySectorId';
import { Area } from '../../../models/Area';
import { Sector } from '../../../models/Sector';
import { useScheduleCompliance } from '../hooks/useScheduleCompliance';
import { CompliancePeriod, CompliancePeriodResult, GetScheduleComplianceParams } from '../adapters/getScheduleComplianceByPeriodAdapter';
import { useOpenReportResult } from '../hooks/useOpenReportResult';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { addExcelLetterhead, drawPdfLetterhead, loadLetterhead } from '../../../components/reportLetterhead';
import ReportPreview from '../../../components/ReportPreview';
import ReportCard from '../../../components/ReportCard';
import { ReportSelect, ReportDate, SelectOption } from '../../../components/ReportField';
import { parseDateInput, toDateInputValue } from '../utils/dateRange';
import { ColumnOption } from '../../../components/ColumnSelector';

const REPORT_TITLE = 'Reporte de Programaciones';

const PERIOD_OPTIONS: SelectOption[] = [
  { value: 'daily',   label: 'Día a Día' },
  { value: 'weekly',  label: 'Semana a Semana' },
  { value: 'monthly', label: 'Mes a Mes' },
];

const CHECK_COLUMNS: ColumnOption[] = [
  { key: 'periodLabel',          label: 'Periodo' },
  { key: 'compliancePercentage', label: 'Porcentaje (%)' },
];

const GOLD_BTN = 'flex items-center gap-2 px-6 py-2.5 bg-primary-gold text-white rounded-full hover:opacity-95 disabled:opacity-40 transition-all active:scale-95 text-xs font-bold shadow-[0_4px_12px_rgba(221,152,3,0.25)]';
const SLATE_BTN = 'px-6 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-all active:scale-95';

const averageOf = (list: CompliancePeriodResult[]) =>
  list.reduce((s, i) => s + i.compliancePercentage, 0) / (list.length || 1);

const toObjRows = (list: CompliancePeriodResult[]): Record<string, any>[] =>
  list.map((i) => ({ periodLabel: i.periodLabel, compliancePercentage: i.compliancePercentage.toFixed(2) }));

const averageObjRow = (list: CompliancePeriodResult[]): Record<string, any> =>
  ({ periodLabel: 'Promedio', compliancePercentage: averageOf(list).toFixed(2) });

const CheckReport: React.FC = () => {
  const { data, loading, error, fetchCompliance, fetchDirect } = useScheduleCompliance();
  const openResult = useOpenReportResult();


  const [filters, setFilters] = useState({
    startDate:  new Date(),
    endDate:    new Date(),
    sedeId:     null as string | null,
    sectorId:   null as string | null,
    areaId:     null as number | null,
    categoryId: null as string | null,
    period:     'weekly' as CompliancePeriod,
  });

  const { sedes, loading: sedesLoading }     = useEnabledSedesForUser();
  const [sectors, setSectors]                = useState<Sector[]>([]);
  const [sectorsLoading, setSectorsLoading]  = useState(false);
  const { categorias, loading: catsLoading } = useFetchCategorias();
  const { areas, loading: areasLoading }     = useAreasBySectorId(filters.sectorId || '');
  const [loadingPDF, setLoadingPDF]          = useState(false);
  const [loadingExcel, setLoadingExcel]      = useState(false);

  useEffect(() => {
    if (filters.sedeId) {
      setSectorsLoading(true);
      fetchSectorsBySedeIds({ sedeIds: [filters.sedeId] }).then((s) => {
        setSectors(s); setSectorsLoading(false);
      });
    } else { setSectors([]); }
  }, [filters.sedeId]);

  const patch = (fields: Partial<typeof filters>) => setFilters((prev) => ({ ...prev, ...fields }));

  const buildParams = (): GetScheduleComplianceParams => ({
    startDate:  filters.startDate,
    endDate:    filters.endDate,
    period:     filters.period,
    sedeId:     filters.sedeId!,
    sectorId:   filters.sectorId,
    areaId:     filters.areaId,
    categoryId: filters.categoryId,
  });

  const sedeName = sedes.find((s) => s.id === filters.sedeId)?.name || 'N/A';
  const periodLabel = PERIOD_OPTIONS.find((p) => p.value === filters.period)?.label || '';

  const handleSearch = () => fetchCompliance(buildParams());

  /** Lleva el resultado a su propia página, sin tocar la previsualización. */
  const handleWebView = () => {
    openResult(
      fetchDirect(buildParams()).then((rows) => {
        const avg = averageObjRow(rows);
        return {
          title: REPORT_TITLE,
          subtitle: `Reporte ${periodLabel} · Sede ${sedeName}`,
          headers: CHECK_COLUMNS.map((c) => c.label),
          rows: toObjRows(rows).map((o) => CHECK_COLUMNS.map((c) => o[c.key])),
          footer: CHECK_COLUMNS.map((c) => avg[c.key]),
        };
      }),
    );
  };

  const handleClear = () => {
    setFilters({
      startDate: new Date(), endDate: new Date(),
      sedeId: null, sectorId: null, areaId: null, categoryId: null, period: 'weekly',
    });
    setSectors([]);
  };

  const buildPDF = async (reportData: CompliancePeriodResult[]) => {
    if (!reportData?.length) return;
    const doc = new jsPDF();
    const letterhead = await loadLetterhead();

    doc.setFontSize(16); doc.text('REPORTE DE PROGRAMACIONES', 14, 25);
    doc.setFontSize(11);
    doc.text(`Sede: ${sedeName}`, 14, 33);
    doc.text(`Reporte ${periodLabel} del ${filters.startDate.toLocaleDateString()} al ${filters.endDate.toLocaleDateString()}`, 14, 39);
    const body = reportData.map((i) => [i.periodLabel, i.compliancePercentage.toFixed(2)]);
    body.push(['Promedio', averageOf(reportData).toFixed(2)]);
    (doc as any).autoTable({
      startY: 46,
      margin: { top: 46 },
      head: [CHECK_COLUMNS.map((c) => c.label)],
      body,
      theme: 'grid',
      willDrawPage: () => drawPdfLetterhead(doc, letterhead, 210, 14),
    });
    doc.save('Reporte_Programaciones.pdf');
  };

  const buildExcel = async (reportData: CompliancePeriodResult[]) => {
    if (!reportData?.length) return;
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Reporte de Programaciones');
    const letterheadRows = addExcelLetterhead(wb, ws, await loadLetterhead(), CHECK_COLUMNS.length);
    const merge = (row: number, value: string) => {
      ws.mergeCells(row, 1, row, 2);
      ws.getCell(row, 1).value = value;
      ws.getCell(row, 1).alignment = { vertical: 'middle', horizontal: 'center' };
    };
    merge(letterheadRows + 1, 'REPORTE DE PROGRAMACIONES');
    ws.getCell(letterheadRows + 1, 1).font = { bold: true, size: 16 };
    merge(letterheadRows + 2, `Sede: ${sedeName}`);
    merge(letterheadRows + 3, `Reporte ${periodLabel} del ${filters.startDate.toLocaleDateString()} al ${filters.endDate.toLocaleDateString()}`);
    const hRow = ws.addRow(CHECK_COLUMNS.map((c) => c.label));
    hRow.font = { bold: true };
    hRow.eachCell((c) => { c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D9D9D9' } }; });
    reportData.forEach((i) => ws.addRow([i.periodLabel, i.compliancePercentage.toFixed(2)]));
    const tRow = ws.addRow(['Promedio', averageOf(reportData).toFixed(2)]);
    tRow.font = { bold: true };
    tRow.eachCell((c) => { c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D9D9D9' } }; });
    ws.columns.forEach((col) => { col.width = 24; });
    saveAs(new Blob([await wb.xlsx.writeBuffer()]), 'Reporte_Programaciones.xlsx');
  };

  const handleGeneratePDF = async () => {
    setLoadingPDF(true);
    try { await buildPDF(await fetchDirect(buildParams())); }
    catch (e) { console.error(e); }
    finally { setLoadingPDF(false); }
  };

  const handleGenerateExcel = async () => {
    setLoadingExcel(true);
    try { await buildExcel(await fetchDirect(buildParams())); }
    catch (e) { console.error(e); }
    finally { setLoadingExcel(false); }
  };

  const previewRows = data ? [...toObjRows(data), averageObjRow(data)] : [];

  return (
    <div className="space-y-6">
      {/* Filtros (full-width) */}
      <ReportCard title="Filtros de búsqueda" bodyClassName="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ReportSelect
            label="Sede" isLoading={sedesLoading}
            options={sedes.map((s) => ({ value: s.id, label: s.name }))}
            value={filters.sedeId || ''}
            onChange={(v) => patch({ sedeId: v || null, sectorId: null, areaId: null })}
          />
          <ReportSelect
            label="Sector" isLoading={sectorsLoading} isDisabled={!filters.sedeId}
            options={sectors.map((s) => ({ value: s.id, label: s.name }))}
            value={filters.sectorId || ''}
            onChange={(v) => patch({ sectorId: v || null, areaId: null })}
          />
          <ReportSelect
            label="Área" isLoading={areasLoading} isDisabled={!filters.sectorId}
            options={areas.map((a: Area) => ({ value: String(a.area_id), label: `${a.area_id} — ${a.name}` }))}
            value={filters.areaId != null ? String(filters.areaId) : ''}
            onChange={(v) => patch({ areaId: v ? Number(v) : null })}
          />
          <ReportSelect
            label="Categoría" isLoading={catsLoading}
            options={categorias.map((c) => ({ value: c.id, label: c.name }))}
            value={filters.categoryId || ''}
            onChange={(v) => patch({ categoryId: v || null })}
          />
          <ReportSelect
            label="Periodo"
            options={PERIOD_OPTIONS}
            value={filters.period}
            onChange={(v) => patch({ period: (v || 'weekly') as CompliancePeriod })}
          />
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Fechas</label>
            <div className="grid grid-cols-2 gap-2">
              <ReportDate value={toDateInputValue(filters.startDate)} onChange={(v) => patch({ startDate: parseDateInput(v) })} />
              <ReportDate value={toDateInputValue(filters.endDate)} onChange={(v) => patch({ endDate: parseDateInput(v) })} />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-neutral-100">
          <button type="button" onClick={handleWebView} className={GOLD_BTN}>
            <FiExternalLink className="w-4 h-4" />
            Ver en web
          </button>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={handleClear} className={SLATE_BTN}>Limpiar</button>
            <button type="button" onClick={handleSearch} disabled={loading} className={GOLD_BTN}>
              <FiSearch className="w-3.5 h-3.5" />
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
            <button type="button" onClick={handleGeneratePDF} disabled={loadingPDF} className={GOLD_BTN}>
              <FiFileText className="w-3.5 h-3.5" />
              Descargar PDF
            </button>
            <button type="button" onClick={handleGenerateExcel} disabled={loadingExcel} className={GOLD_BTN}>
              <FiDownload className="w-3.5 h-3.5" />
              Descargar Excel
            </button>
          </div>
        </div>
      </ReportCard>

      {error && (
        <div className="p-4 bg-danger-200/30 border border-danger-200 text-danger-700 rounded-2xl text-center text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Previsualización */}
      <div className="bg-white border border-neutral-100 rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6 md:p-8">
        <ReportPreview
          title={REPORT_TITLE}
          subtitle={`Pristine · ${periodLabel}`}
          results={previewRows}
          selectedColumns={CHECK_COLUMNS}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default CheckReport;
