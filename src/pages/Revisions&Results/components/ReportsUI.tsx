// ReportsUI.tsx
// Módulo compartido con el patrón de diseño de los reportes de Checklist.
// Se coloca junto a los reportes (misma carpeta que RevisionsReport, ListReport, etc.)
// y se importa como './ReportsUI'.
//
// Exporta:
//   - Estilos:   reportFieldClass, btnPrimary, btnGhost, Req
//   - UI:        TransferList, DocumentPreview, PreviewToggle
//   - Export:    exportReportPdf, exportReportExcel
//
// Paleta: tokens del tailwind.config (primary / surface / action / danger / neutral / success).

import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { addExcelLetterhead, drawPdfLetterhead, loadLetterhead } from '../../../components/reportLetterhead';
import {
  FaFileExcel, FaFilePdf, FaEraser,
  FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight,
} from 'react-icons/fa';

export interface ColumnDef<K extends string = string> {
  key: K;
  label: string;
}

// ─────────────── estilos reutilizables ───────────────
export const reportFieldClass =
  'w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 ' +
  'focus:border-action focus:ring-2 focus:ring-action-200 focus:outline-none ' +
  'disabled:bg-surface-app disabled:text-neutral-400 transition-colors';

export const btnPrimary =
  'inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white ' +
  'hover:bg-primary-dark disabled:opacity-50 transition-colors';

export const btnGhost =
  'inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm ' +
  'font-semibold text-neutral-700 hover:bg-surface-app transition-colors';

export const Req: React.FC = () => <span className="text-danger">*</span>;

const cellValue = (row: any, key: string) => {
  const v = row?.[key];
  return v === null || v === undefined || v === '' ? '—' : String(v);
};

// ─────────────── export a PDF / Excel ───────────────
export async function exportReportPdf<K extends string>(title: string, columns: ColumnDef<K>[], data: any[]) {
  if (!columns.length) return;
  const isLandscape = columns.length > 6;
  const doc = new jsPDF({ orientation: isLandscape ? 'landscape' : 'portrait' });
  const letterhead = await loadLetterhead();

  doc.setFontSize(16); doc.text(title, 14, 25);
  (doc as any).autoTable({
    startY: 31,
    margin: { top: 31 },
    head: [columns.map((c) => c.label)],
    body: (data ?? []).map((r) => columns.map((c) => cellValue(r, c.key))),
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [45, 60, 73] }, // primary
    willDrawPage: () => drawPdfLetterhead(doc, letterhead, isLandscape ? 297 : 210, 14),
  });
  doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
}

export async function exportReportExcel<K extends string>(title: string, columns: ColumnDef<K>[], data: any[]) {
  if (!columns.length) return;
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(title.slice(0, 31));
  const letterheadRows = addExcelLetterhead(wb, ws, await loadLetterhead(), columns.length);
  const titleRow = letterheadRows + 1;

  ws.mergeCells(titleRow, 1, titleRow, columns.length);
  ws.getCell(titleRow, 1).value = title;
  ws.getCell(titleRow, 1).font = { bold: true, size: 14 };
  ws.getCell(titleRow, 1).alignment = { horizontal: 'center' };
  const hRow = ws.addRow(columns.map((c) => c.label));
  hRow.eachCell((c) => {
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2D3C49' } };
    c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  });
  (data ?? []).forEach((r) => ws.addRow(columns.map((c) => cellValue(r, c.key))));
  ws.columns.forEach((col) => { col.width = 22; });
  saveAs(new Blob([await wb.xlsx.writeBuffer()]), `${title.replace(/\s+/g, '_')}.xlsx`);
}

// ─────────────── botones pequeños ───────────────
const ArrowBtn: React.FC<{ title: string; onClick: () => void; children: React.ReactNode }> = ({ title, onClick, children }) => (
  <button title={title} onClick={onClick}
    className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs text-white hover:bg-primary-dark transition-colors">
    {children}
  </button>
);

// ─────────────── Transfer list (Disponibles / Seleccionadas) ───────────────
interface PaneProps<K extends string> {
  title: string;
  search: string;
  onSearch: (v: string) => void;
  items: ColumnDef<K>[];
  onItemClick: (k: K) => void;
  checked: boolean;
  controls: React.ReactNode;
}

function TransferPane<K extends string>({ title, search, onSearch, items, onItemClick, checked, controls }: PaneProps<K>) {
  return (
    <div className="flex flex-col rounded-xl border border-neutral-200 bg-white">
      <div className="flex items-center justify-between gap-2 border-b border-neutral-200 px-3 py-2">
        <span className="text-sm font-semibold text-neutral-700">{title}</span>
        <div className="flex gap-1">{controls}</div>
      </div>
      <div className="p-2">
        <input value={search} onChange={(e) => onSearch(e.target.value)} placeholder="Buscar…"
          className="mb-2 w-full rounded-md border border-neutral-200 px-2 py-1.5 text-sm focus:border-action focus:ring-2 focus:ring-action-200 focus:outline-none" />
        <ul className="h-56 space-y-1 overflow-y-auto pr-1">
          {items.length === 0 && (
            <li className="px-2 py-6 text-center text-xs text-neutral-400">Sin columnas</li>
          )}
          {items.map((c) => (
            <li key={c.key}>
              <button onClick={() => onItemClick(c.key)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-neutral-700 hover:bg-surface-app transition-colors">
                <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                  checked ? 'border-primary bg-primary text-white' : 'border-neutral-400 bg-white'
                }`}>
                  {checked && (
                    <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2.5 6.5l2.5 2.5 4.5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                {c.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function TransferList<K extends string>({
  allColumns, columns, onChange,
}: {
  allColumns: ColumnDef<K>[];
  columns: Record<K, boolean>;
  onChange: (next: Record<K, boolean>) => void;
}) {
  const [availSearch, setAvailSearch] = useState('');
  const [selSearch, setSelSearch] = useState('');

  const available = allColumns.filter((c) => !columns[c.key]);
  const selected  = allColumns.filter((c) => columns[c.key]);
  const availF = available.filter((c) => c.label.toLowerCase().includes(availSearch.toLowerCase()));
  const selF   = selected.filter((c) => c.label.toLowerCase().includes(selSearch.toLowerCase()));

  const setKeys = (keys: K[], value: boolean) => {
    const next = { ...columns };
    keys.forEach((k) => { next[k] = value; });
    onChange(next);
  };
  const moveAll = (value: boolean) => setKeys(allColumns.map((c) => c.key), value);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-neutral-700">
          <input type="checkbox"
            checked={selected.length === allColumns.length}
            onChange={(e) => moveAll(e.target.checked)}
            className="h-4 w-4 accent-action" />
          Seleccionar todas
        </label>
        <button onClick={() => moveAll(false)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark transition-colors">
          <FaEraser /> Limpiar selección
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <TransferPane
          title={`${available.length} disponibles`}
          search={availSearch} onSearch={setAvailSearch}
          items={availF} onItemClick={(k) => setKeys([k], true)} checked={false}
          controls={
            <>
              <ArrowBtn title="Mover visibles →" onClick={() => setKeys(availF.map((c) => c.key), true)}><FaChevronRight /></ArrowBtn>
              <ArrowBtn title="Mover todo →" onClick={() => moveAll(true)}><FaAngleDoubleRight /></ArrowBtn>
            </>
          }
        />
        <TransferPane
          title={`${selected.length} seleccionados`}
          search={selSearch} onSearch={setSelSearch}
          items={selF} onItemClick={(k) => setKeys([k], false)} checked
          controls={
            <>
              <ArrowBtn title="← Quitar todo" onClick={() => moveAll(false)}><FaAngleDoubleLeft /></ArrowBtn>
              <ArrowBtn title="← Quitar visibles" onClick={() => setKeys(selF.map((c) => c.key), false)}><FaChevronLeft /></ArrowBtn>
            </>
          }
        />
      </div>
    </div>
  );
}

// ─────────────── Toggle de previsualización ───────────────
export const PreviewToggle: React.FC<{ mode: 'excel' | 'pdf'; onChange: (m: 'excel' | 'pdf') => void }> = ({ mode, onChange }) => {
  const Btn: React.FC<{ value: 'excel' | 'pdf'; children: React.ReactNode }> = ({ value, children }) => (
    <button onClick={() => onChange(value)}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
        mode === value ? 'bg-primary text-white' : 'bg-surface-app text-neutral-700 hover:bg-neutral-200'
      }`}>
      {children}
    </button>
  );
  return (
    <div className="flex gap-2">
      <Btn value="excel"><FaFileExcel /> Vista Excel</Btn>
      <Btn value="pdf"><FaFilePdf /> Vista PDF</Btn>
    </div>
  );
};

// ─────────────── Previsualización de documento ───────────────
export function DocumentPreview<K extends string>({
  title, mode, columns, rows,
}: {
  title: string;
  mode: 'excel' | 'pdf';
  columns: ColumnDef<K>[];
  rows: any[];
}) {
  if (!columns.length) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-surface-app text-sm text-neutral-400">
        Selecciona al menos una columna para previsualizar el documento.
      </div>
    );
  }
  const isExcel = mode === 'excel';

  return (
    <div className={`overflow-hidden rounded-2xl border ${isExcel ? 'border-success-200' : 'border-neutral-200'} bg-neutral-900 p-4`}>
      <div className="mb-3 flex items-center gap-2 px-1">
        <span className={`h-2.5 w-2.5 rounded-full ${isExcel ? 'bg-success-500' : 'bg-danger-500'}`} />
        <span className="text-xs font-medium text-surface-200">
          {`${title.replace(/\s+/g, '_')}.${isExcel ? 'xlsx' : 'pdf'}`}
        </span>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-inner">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-surface-900">{title}</h3>
            <p className="text-xs text-neutral-400">Generado: {new Date().toLocaleDateString()}</p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-gold text-xs font-black text-primary">P</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className={isExcel ? 'bg-surface-app' : 'bg-primary text-white'}>
                {isExcel && <th className="w-8 border border-neutral-200 px-2 py-1 text-xs text-neutral-400"> </th>}
                {columns.map((c) => (
                  <th key={c.key}
                    className={`whitespace-nowrap px-3 py-2 text-left text-xs font-semibold ${
                      isExcel ? 'border border-neutral-200 text-neutral-700' : 'text-white'
                    }`}>
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className={isExcel ? '' : i % 2 ? 'bg-surface-app' : 'bg-white'}>
                  {isExcel && (
                    <td className="border border-neutral-200 bg-surface-app px-2 py-1 text-center text-xs text-neutral-400">{i + 1}</td>
                  )}
                  {columns.map((c) => (
                    <td key={c.key}
                      className={`whitespace-nowrap px-3 py-2 text-neutral-700 ${
                        isExcel ? 'border border-neutral-200' : 'border-b border-neutral-200'
                      }`}>
                      {row ? cellValue(row, c.key) : <span className="text-neutral-200">██████</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
