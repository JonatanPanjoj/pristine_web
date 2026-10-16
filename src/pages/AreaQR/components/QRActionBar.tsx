// components/QRActionBar.tsx
// Acciones de exportación de etiquetas QR. Todas generan el archivo y lo
// descargan directamente: ninguna abre el diálogo de impresión del navegador.

import React, { useState } from 'react';
import { FiImage, FiFileText, FiGrid, FiCheckSquare } from 'react-icons/fi';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { AreaItemData } from './AreaItemCard';

// A4 vertical (mm) y rejilla para el modo "varios en una hoja".
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 10;
const SINGLE_LABEL_WIDTH = 150;
const GRID_COLUMNS = 2;
const GRID_ROWS = 3;
const GRID_GAP = 6;

const PRIMARY_BTN =
  'w-full bg-primary-gold hover:opacity-95 text-white font-bold px-5 py-3.5 rounded-full flex items-center justify-center gap-2.5 text-xs sm:text-sm transition-all shadow-[0_4px_14px_rgba(252,181,33,0.3)] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed';
const SECONDARY_BTN =
  'w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-5 py-3.5 rounded-full flex items-center justify-center gap-2.5 text-xs sm:text-sm transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed';

interface QRActionBarProps {
  selectedItems: AreaItemData[];
  onSelectAll: () => void;
}

export const QRActionBar: React.FC<QRActionBarProps> = ({ selectedItems, onSelectAll }) => {
  const [busy, setBusy] = useState<null | 'single' | 'grid' | 'image'>(null);
  const hasSelection = selectedItems.length > 0;

  /** Captura la etiqueta ya renderizada (contenedor oculto de la vista). */
  const captureLabel = async (item: AreaItemData): Promise<HTMLCanvasElement | null> => {
    const element = document.getElementById(`single-card-${item.id}`);
    if (!element) return null;
    return html2canvas(element, { scale: 3, backgroundColor: '#ffffff' });
  };

  // Una etiqueta por hoja, centrada en la página.
  const handleDownloadPerPage = async () => {
    if (!hasSelection) return;
    setBusy('single');
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      let isFirstPage = true;

      for (const item of selectedItems) {
        const canvas = await captureLabel(item);
        if (!canvas) continue;

        if (!isFirstPage) pdf.addPage();
        isFirstPage = false;

        const height = (canvas.height * SINGLE_LABEL_WIDTH) / canvas.width;
        pdf.addImage(
          canvas.toDataURL('image/png'),
          'PNG',
          (PAGE_WIDTH - SINGLE_LABEL_WIDTH) / 2,
          Math.max(MARGIN, (PAGE_HEIGHT - height) / 2),
          SINGLE_LABEL_WIDTH,
          height,
        );
      }

      pdf.save(fileName(selectedItems, 'etiquetas'));
    } catch (error) {
      console.error('Error al generar el PDF de etiquetas:', error);
    } finally {
      setBusy(null);
    }
  };

  // Varias etiquetas por hoja, en rejilla.
  const handleDownloadGrid = async () => {
    if (!hasSelection) return;
    setBusy('grid');
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const cellWidth = (PAGE_WIDTH - MARGIN * 2 - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;
      const cellHeight = (PAGE_HEIGHT - MARGIN * 2 - GRID_GAP * (GRID_ROWS - 1)) / GRID_ROWS;
      const perPage = GRID_COLUMNS * GRID_ROWS;
      let position = 0;

      for (const item of selectedItems) {
        const canvas = await captureLabel(item);
        if (!canvas) continue;

        if (position > 0 && position % perPage === 0) pdf.addPage();
        const slot = position % perPage;
        const column = slot % GRID_COLUMNS;
        const row = Math.floor(slot / GRID_COLUMNS);

        const scale = Math.min(cellWidth / canvas.width, cellHeight / canvas.height);
        const width = canvas.width * scale;
        const height = canvas.height * scale;

        pdf.addImage(
          canvas.toDataURL('image/png'),
          'PNG',
          MARGIN + column * (cellWidth + GRID_GAP) + (cellWidth - width) / 2,
          MARGIN + row * (cellHeight + GRID_GAP) + (cellHeight - height) / 2,
          width,
          height,
        );
        position++;
      }

      pdf.save(fileName(selectedItems, 'etiquetas-hoja'));
    } catch (error) {
      console.error('Error al generar el PDF en rejilla:', error);
    } finally {
      setBusy(null);
    }
  };

  // Un PNG por área.
  const handleDownloadImages = async () => {
    if (!hasSelection) return;
    setBusy('image');
    try {
      for (const item of selectedItems) {
        const canvas = await captureLabel(item);
        if (!canvas) continue;

        const link = document.createElement('a');
        link.download = `qr_${item.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${item.area_id}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    } catch (error) {
      console.error('Error al generar las imágenes:', error);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-5 md:p-6 border-0">
      <p className="text-xs font-semibold text-slate-500 mb-4">
        {hasSelection
          ? `${selectedItems.length} área${selectedItems.length !== 1 ? 's' : ''} seleccionada${selectedItems.length !== 1 ? 's' : ''} · el archivo se descarga directamente`
          : 'Selecciona al menos un área para exportar sus etiquetas'}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button type="button" onClick={onSelectAll} className={SECONDARY_BTN}>
          <FiCheckSquare className="w-4 h-4" />
          <span>Seleccionar todas</span>
        </button>

        <button type="button" onClick={handleDownloadPerPage} disabled={!hasSelection || busy !== null} className={PRIMARY_BTN}>
          <FiFileText className="w-4 h-4" />
          <span>{busy === 'single' ? 'Generando…' : 'Imprimir seleccionadas (1 por hoja)'}</span>
        </button>

        <button type="button" onClick={handleDownloadGrid} disabled={!hasSelection || busy !== null} className={PRIMARY_BTN}>
          <FiGrid className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{busy === 'grid' ? 'Generando…' : 'Varias en una hoja'}</span>
        </button>

        <button type="button" onClick={handleDownloadImages} disabled={!hasSelection || busy !== null} className={PRIMARY_BTN}>
          <FiImage className="w-4 h-4" />
          <span>{busy === 'image' ? 'Generando…' : 'Descargar imágenes'}</span>
        </button>
      </div>
    </div>
  );
};

const fileName = (items: AreaItemData[], prefix: string): string =>
  items.length === 1
    ? `${prefix}-${items[0].area_id}.pdf`
    : `${prefix}-${items.length}-areas.pdf`;

export default QRActionBar;
