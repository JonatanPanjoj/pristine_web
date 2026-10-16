// components/reportLetterhead.ts
// Membrete corporativo de los reportes: logo, momento de generación y quién lo
// generó. Lo comparten los reportes de PPM y de Checklist, en PDF y en Excel,
// para que todo lo que sale de la aplicación se reconozca como suyo.
//
// El nombre se lee del store en lugar de recibirse por parámetro: los
// exportadores son funciones sueltas a las que llaman una docena de pantallas, y
// hacer viajar el dato por todas ellas solo para estamparlo aquí no compensa.

import jsPDF from 'jspdf';
import ExcelJS from 'exceljs';
import store from '../store/store';
import logoSource from '../assets/img/logo.png';

const LOGO_ALIAS = 'report-logo';
const LOGO_HEIGHT_MM = 12;
const EXCEL_LOGO_HEIGHT_PX = 52;

export interface Letterhead {
  printedAt: Date;
  printedBy: string;
  /** El logo en data URL, o null si no se pudo leer. */
  logo: string | null;
}

/** El logo se lee una vez por sesión: es un archivo del propio paquete. */
let logoPromise: Promise<string | null> | null = null;

export const loadLetterhead = async (): Promise<Letterhead> => ({
  printedAt: new Date(),
  printedBy: store.getState().user.user?.name ?? '—',
  logo: await loadLogo(),
});

/**
 * Estampa el membrete en la hoja actual del PDF.
 * @param pageWidth - Ancho de la hoja en mm; cambia entre vertical y apaisado.
 * @param margin - Margen lateral del documento, para alinear con su contenido.
 */
export const drawPdfLetterhead = (
  doc: jsPDF,
  { printedAt, printedBy, logo }: Letterhead,
  pageWidth: number,
  margin: number
): void => {
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);

  doc.setFont('helvetica', 'bold');
  doc.text('Fecha/Hora de impresión:', margin, 10);
  doc.text('Impreso por:', margin, 14.5);

  doc.setFont('helvetica', 'normal');
  doc.text(formatStamp(printedAt), margin + 38, 10);
  doc.text(printedBy, margin + 38, 14.5);

  if (!logo) return;

  const { width, height } = logoSize(doc, logo);
  doc.addImage(logo, imageFormat(logo), pageWidth - margin - width, 5, width, height, LOGO_ALIAS, 'FAST');
};

/**
 * Escribe el membrete en las primeras filas de la hoja de cálculo.
 * @returns Las filas ocupadas, para que el contenido empiece debajo.
 */
export const addExcelLetterhead = (
  workbook: ExcelJS.Workbook,
  worksheet: ExcelJS.Worksheet,
  { printedAt, printedBy, logo }: Letterhead,
  columnCount: number
): number => {
  const lastColumn = Math.max(2, columnCount);

  worksheet.mergeCells(1, 1, 1, lastColumn);
  worksheet.getCell('A1').value = `Fecha/Hora de impresión: ${formatStamp(printedAt)}`;
  worksheet.mergeCells(2, 1, 2, lastColumn);
  worksheet.getCell('A2').value = `Impreso por: ${printedBy}`;

  [1, 2].forEach((row) => {
    worksheet.getCell(row, 1).font = { size: 10, bold: true, color: { argb: 'FF334155' } };
    worksheet.getRow(row).height = 16;
  });

  if (logo) {
    const imageId = workbook.addImage({ base64: logo, extension: imageFormat(logo) === 'PNG' ? 'png' : 'jpeg' });
    // Anclado arriba a la derecha, sin empujar las columnas del reporte.
    worksheet.addImage(imageId, {
      tl: { col: Math.max(0, lastColumn - 1), row: 0 },
      ext: { width: EXCEL_LOGO_HEIGHT_PX, height: EXCEL_LOGO_HEIGHT_PX },
    });
    worksheet.getRow(1).height = 26;
    worksheet.getRow(2).height = 26;
  }

  worksheet.addRow([]);

  return 3;
};

const loadLogo = (): Promise<string | null> => {
  if (!logoPromise) logoPromise = fetchAsDataUrl(logoSource);

  return logoPromise;
};

/** El logo vive en el propio paquete, así que basta con leerlo del mismo origen. */
const fetchAsDataUrl = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    return await readAsDataUrl(await response.blob());
  } catch {
    return null;
  }
};

const readAsDataUrl = (blob: Blob): Promise<string | null> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(blob);
  });

/** El logo se dibuja a alto fijo; el ancho sale de sus proporciones. */
const logoSize = (doc: jsPDF, logo: string): { width: number; height: number } => {
  const properties = doc.getImageProperties(logo);

  return { width: LOGO_HEIGHT_MM * (properties.width / properties.height), height: LOGO_HEIGHT_MM };
};

/** Anunciar un formato que no es el del archivo hace fallar a jsPDF. */
const imageFormat = (dataUrl: string): string => (dataUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG');

const formatStamp = (when: Date): string => {
  const pad = (value: number): string => String(value).padStart(2, '0');
  const day = `${pad(when.getDate())}/${pad(when.getMonth() + 1)}/${when.getFullYear()}`;

  return `${day} ${pad(when.getHours())}:${pad(when.getMinutes())}`;
};
