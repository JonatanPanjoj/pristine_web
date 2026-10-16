// components/reportExport.ts
// Exportación genérica de reportes a Excel y PDF a partir de filas
// (Record<string, any>) y las columnas seleccionadas (ColumnOption[]). Título
// dorado + cabecera oscura, consistente con el sistema visual de reportes.

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { ColumnOption } from "./ColumnSelector";
import { addExcelLetterhead, drawPdfLetterhead, loadLetterhead } from "./reportLetterhead";
import { PhotoCache, loadPhoto, measurePhoto, photoFormat } from "./reportPhotoData";

const PDF_PAGE_WIDTH = 297; // A4 apaisado (mm)
const PDF_PAGE_HEIGHT = 210;
const PDF_MARGIN = 14;
const PDF_CONTENT_TOP = 31;    // bajo el membrete y el título
const PDF_CONTENT_BOTTOM = 16; // sobre el pie de página
const LINK_COLOR = "FF0563C1";
const DEFAULT_LINK_TEXT = "Ver foto";

// Anexo fotográfico: rejilla de fotos contiguas, todas del mismo tamaño de marco.
const ANNEX_COLUMNS = 3;
const ANNEX_ROWS = 2;
const ANNEX_PER_PAGE = ANNEX_COLUMNS * ANNEX_ROWS;
const ANNEX_GAP = 6;              // separación entre fotos (mm)
const ANNEX_HEADER_HEIGHT = 26;   // banda del título de la página de anexos
const ANNEX_CAPTION_HEIGHT = 12;  // texto bajo cada foto
const ANNEX_CAPTION_LINES = 2;

/**
 * Un conjunto de fotos de la fila (las del activo, las del antes, las del
 * después…). Cada conjunto es independiente: se ve, se anexa y se recorre por
 * separado, nunca mezclado con los demás.
 */
export interface ReportPhotoSet {
  /** Columna de portada: es la única foto que viaja al Excel. */
  urlKey: string;
  /** Campo con todas las fotos del conjunto; alimenta el PDF y la galería. */
  urlsKey?: string;
  /** Rótulo del conjunto en el anexo y en la galería. */
  label?: string;
}

export interface ReportExportOptions {
  // Dibuja la papelería de Pristine (marca + círculos decorativos) en el PDF.
  letterhead?: boolean;
  // Columnas cuyo valor es una URL: en Excel se escriben como hipervínculo.
  linkColumns?: string[];
  // Texto del hipervínculo por columna; sin él se escribe «Ver foto».
  linkLabels?: Record<string, string>;
  // Genera páginas de anexo al final del PDF con las fotos de cada fila.
  photoAnnex?: {
    sets: ReportPhotoSet[];
    captionKeys?: string[];
  };
}

/** Valor de celda listo para mostrar (Excel, PDF y vista web comparten formato). */
export const formatReportValue = (v: any): string => {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "string") {
    const d = new Date(v);
    // Solo convierte strings ISO de fecha; deja el resto intacto
    return /^\d{4}-\d{2}-\d{2}T/.test(v) && !isNaN(d.getTime()) ? d.toLocaleString("es-GT") : v;
  }
  return String(v);
};

const fileStamp = (name: string, ext: string) =>
  `${name.replace(/[^\w]+/g, "_")}_${Date.now()}.${ext}`;

// Ancho útil de un A4 apaisado menos los márgenes, y ancho mínimo por columna
// para que el texto siga siendo legible. Por debajo de eso autoTable comprime
// las celdas hasta que el contenido se sale de la hoja.
const PDF_USABLE_WIDTH = PDF_PAGE_WIDTH - PDF_MARGIN * 2;
const MIN_COLUMN_WIDTH = 24;

export const MAX_PDF_COLUMNS = Math.floor(PDF_USABLE_WIDTH / MIN_COLUMN_WIDTH);

/**
 * ¿Caben estas columnas en el PDF sin desbordarse?
 * @param columnCount - Número de columnas seleccionadas.
 */
export const fitsInPdf = (columnCount: number): boolean => columnCount <= MAX_PDF_COLUMNS;

export const exportReportExcel = async (
  title: string,
  results: Record<string, any>[],
  columns: ColumnOption[],
  options: ReportExportOptions = {},
): Promise<void> => {
  if (results.length === 0 || columns.length === 0) return;

  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet("Reporte");

  const letterheadRows = addExcelLetterhead(workbook, ws, await loadLetterhead(), columns.length);
  const titleRow = letterheadRows + 1;

  ws.mergeCells(titleRow, 1, titleRow, Math.max(1, columns.length));
  const titleCell = ws.getCell(titleRow, 1);
  titleCell.value = title;
  titleCell.font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } };
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFCB521" } }; // primary-gold
  titleCell.alignment = { vertical: "middle", horizontal: "center" };

  ws.addRow([]);

  const headerRow = ws.addRow(columns.map((c) => c.label));
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2D3C49" } }; // primary
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  const linkColumns = new Set(options.linkColumns ?? []);
  results.forEach((row) => {
    const excelRow = ws.addRow(columns.map((c) => formatReportValue(row[c.key])));
    columns.forEach((col, index) => {
      if (linkColumns.has(col.key)) {
        applyHyperlink(excelRow.getCell(index + 1), row[col.key], options.linkLabels?.[col.key]);
      }
    });
  });
  ws.columns.forEach((col) => { col.width = 22; });

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(
    new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    fileStamp(title, "xlsx"),
  );
};

export const exportReportPdf = async (
  title: string,
  results: Record<string, any>[],
  columns: ColumnOption[],
  options: ReportExportOptions = {},
): Promise<void> => {
  if (results.length === 0 || columns.length === 0) return;
  // Guardarraíl: con demasiadas columnas la tabla se sale de la hoja y el PDF
  // resulta ilegible. Quien llama debe impedirlo antes con fitsInPdf().
  if (!fitsInPdf(columns.length)) {
    console.warn(`[reportExport] ${columns.length} columnas exceden el máximo de ${MAX_PDF_COLUMNS} para PDF.`);
    return;
  }

  const doc = new jsPDF("l", "mm", "a4");
  const letterhead = await loadLetterhead();

  (doc as any).autoTable({
    startY: PDF_CONTENT_TOP,
    margin: { top: PDF_CONTENT_TOP, left: PDF_MARGIN, right: PDF_MARGIN, bottom: PDF_CONTENT_BOTTOM },
    head: [columns.map((c) => c.label)],
    body: results.map((row) => columns.map((c) => formatReportValue(row[c.key]))),
    theme: "grid",
    headStyles: { fillColor: [252, 181, 33], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
    bodyStyles: { textColor: [40, 40, 40], fontSize: 8 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    // `linebreak` reparte el ancho útil y envuelve el texto: ninguna celda se
    // sale de la hoja aunque traiga una descripción larga.
    styles: { lineColor: [226, 232, 240], lineWidth: 0.1, overflow: "linebreak", cellPadding: 2, valign: "middle" },
    // La papelería y el título se repintan antes de la tabla de cada página; el
    // pie, después, para que quede sobre el fondo.
    willDrawPage: () => {
      if (options.letterhead) drawLetterhead(doc);
      drawPdfLetterhead(doc, letterhead, PDF_PAGE_WIDTH, PDF_MARGIN);
      drawPdfTitle(doc, title);
    },
    didDrawPage: () => drawPdfFooter(doc),
  });

  if (options.photoAnnex) {
    await appendPhotoAnnex(doc, results, options.photoAnnex);
  }

  doc.save(fileStamp(title, "pdf"));
};

// ── Helpers ───────────────────────────────────────────────────────────────────

interface LoadedImage {
  dataUrl: string;
  width: number;
  height: number;
}

// Papelería de Pristine: círculos suaves en las esquinas y la marca arriba a la
// derecha, replicando la hoja membretada. Se dibuja antes del contenido para que
// quede de fondo.
const drawLetterhead = (doc: jsPDF): void => {
  doc.setFillColor(243, 248, 252); // surface-app baby blue
  doc.rect(0, 0, PDF_PAGE_WIDTH, PDF_PAGE_HEIGHT, "F");

  doc.setFillColor(207, 226, 243); // baby blue suave
  doc.circle(24, 10, 26, "F");
  doc.circle(6, 30, 14, "F");

  doc.setFillColor(186, 226, 248); // celeste baby blue
  doc.circle(PDF_PAGE_WIDTH - 18, PDF_PAGE_HEIGHT - 8, 30, "F");
  doc.circle(PDF_PAGE_WIDTH - 52, PDF_PAGE_HEIGHT - 4, 16, "F");

  // Franja blanca donde se escribe el contenido, para no perder legibilidad.
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(8, 8, PDF_PAGE_WIDTH - 16, PDF_PAGE_HEIGHT - 16, 4, 4, "F");

  doc.setFontSize(12);
  doc.setTextColor(30, 58, 95); // #1E3A5F
  doc.text("PRISTINE", PDF_PAGE_WIDTH - 36, 14);
};

const applyHyperlink = (cell: ExcelJS.Cell, url: any, text = DEFAULT_LINK_TEXT): void => {
  if (typeof url !== "string" || !url) return;
  cell.value = { text, hyperlink: url };
  cell.font = { color: { argb: LINK_COLOR }, underline: true };
};

// El título baja para dejar sitio al membrete, y la línea "Generado" desaparece:
// el membrete ya trae la fecha y la hora.
const drawPdfTitle = (doc: jsPDF, title: string): void => {
  doc.setFontSize(16);
  doc.setTextColor(45, 60, 73); // primary #2D3C49
  doc.text(title, PDF_MARGIN, 25);
};

const drawPdfFooter = (doc: jsPDF): void => {
  const page = (doc as any).internal.getCurrentPageInfo().pageNumber;
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text("Módulo de reportes automatizados de Pristine", PDF_MARGIN, PDF_PAGE_HEIGHT - 12);
  doc.text(`Página ${page}`, PDF_PAGE_WIDTH - PDF_MARGIN, PDF_PAGE_HEIGHT - 12, { align: "right" });
};

// Anexa las fotos en rejilla (3×2 por página), todas con el mismo marco y
// contiguas. Las imágenes que no se puedan cargar (URL caída o CORS bloqueado)
// se omiten sin romper la descarga del PDF.
const appendPhotoAnnex = async (
  doc: jsPDF,
  results: Record<string, any>[],
  annex: NonNullable<ReportExportOptions["photoAnnex"]>,
): Promise<void> => {
  // Cada fila aporta varias fotos por conjunto, y cada conjunto va rotulado con
  // el suyo para que en el papel se sepa de dónde sale cada imagen.
  const entries = results.flatMap((row) => {
    const caption = buildCaption(row, annex.captionKeys);
    return annex.sets.flatMap((set) => {
      const urls = collectPhotoUrls(row, set);
      return urls.map((url, index) => ({
        url,
        caption: [caption, set.label, `Foto ${index + 1}/${urls.length}`].filter(Boolean).join('  ·  '),
      }));
    });
  });

  if (entries.length === 0) return;

  const cache: PhotoCache = new Map();
  const loaded = await Promise.all(entries.map((entry) => loadImage(entry.url, cache)));
  const photos = loaded
    .map((image, index) => ({ image, caption: entries[index].caption }))
    .filter((item): item is { image: LoadedImage; caption: string } => item.image !== null);

  if (photos.length === 0) return;

  const cell = annexCellSize();

  photos.forEach((photo, index) => {
    const positionInPage = index % ANNEX_PER_PAGE;
    if (positionInPage === 0) {
      doc.addPage();
      drawAnnexHeader(doc, Math.floor(index / ANNEX_PER_PAGE) + 1, Math.ceil(photos.length / ANNEX_PER_PAGE));
      drawPdfFooter(doc);
    }
    drawAnnexCell(doc, photo.image, photo.caption, index + 1, positionInPage, cell);
  });
};

interface AnnexCellSize {
  width: number;
  height: number;
  imageHeight: number;
}

// Todas las celdas miden lo mismo: la rejilla se reparte el espacio útil.
const annexCellSize = (): AnnexCellSize => {
  const gridWidth = PDF_PAGE_WIDTH - PDF_MARGIN * 2;
  const gridHeight = PDF_PAGE_HEIGHT - ANNEX_HEADER_HEIGHT - PDF_MARGIN;
  const width = (gridWidth - ANNEX_GAP * (ANNEX_COLUMNS - 1)) / ANNEX_COLUMNS;
  const height = (gridHeight - ANNEX_GAP * (ANNEX_ROWS - 1)) / ANNEX_ROWS;
  return { width, height, imageHeight: height - ANNEX_CAPTION_HEIGHT };
};

const drawAnnexHeader = (doc: jsPDF, page: number, totalPages: number): void => {
  doc.setFontSize(12);
  doc.setTextColor(45, 60, 73);
  doc.text("Anexo fotográfico", PDF_MARGIN, 14);

  doc.setFontSize(9);
  doc.setTextColor(118, 147, 167);
  doc.text(`Anexo ${page} de ${totalPages}`, PDF_PAGE_WIDTH - PDF_MARGIN, 14, { align: "right" });
};

// Dibuja una foto dentro de su marco fijo, centrada y sin deformarse, con el
// número de anexo y el pie debajo.
const drawAnnexCell = (
  doc: jsPDF,
  image: LoadedImage,
  caption: string,
  position: number,
  positionInPage: number,
  cell: AnnexCellSize,
): void => {
  const column = positionInPage % ANNEX_COLUMNS;
  const row = Math.floor(positionInPage / ANNEX_COLUMNS);
  const x = PDF_MARGIN + column * (cell.width + ANNEX_GAP);
  const y = ANNEX_HEADER_HEIGHT + row * (cell.height + ANNEX_GAP);

  // Marco del mismo tamaño para todas, aunque la foto tenga otra proporción.
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.rect(x, y, cell.width, cell.imageHeight);

  const scale = Math.min(cell.width / image.width, cell.imageHeight / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  doc.addImage(
    image.dataUrl,
    photoFormat(image.dataUrl),
    x + (cell.width - width) / 2,
    y + (cell.imageHeight - height) / 2,
    width,
    height,
  );

  doc.setFontSize(7);
  doc.setTextColor(45, 60, 73);
  doc.text(`Foto ${position}`, x, y + cell.imageHeight + 4);

  doc.setTextColor(118, 147, 167);
  const lines = doc.splitTextToSize(caption, cell.width).slice(0, ANNEX_CAPTION_LINES);
  doc.text(lines, x, y + cell.imageHeight + 7.5);
};

/** URLs de un conjunto en una fila: la galería completa, o solo la portada. */
export const collectPhotoUrls = (row: Record<string, any>, set: ReportPhotoSet): string[] => {
  const gallery = set.urlsKey ? row[set.urlsKey] : null;
  if (Array.isArray(gallery)) {
    const urls = gallery.filter((url): url is string => typeof url === "string" && url.length > 0);
    return Array.from(new Set(urls));
  }
  const single = row[set.urlKey];
  return typeof single === "string" && single ? [single] : [];
};

const buildCaption = (row: Record<string, any>, captionKeys?: string[]): string => {
  if (!captionKeys || captionKeys.length === 0) return "";
  return captionKeys
    .map((key) => formatReportValue(row[key]))
    .filter((value) => value !== "—")
    .join("  ·  ");
};

// Las fotos se piden al proxy de imágenes: el CDN sirve una copia cacheada sin
// cabeceras CORS, así que leerlas directamente devolvía siempre null y el anexo
// salía vacío. Nunca lanza: una foto menos no aborta el reporte.
const loadImage = async (url: string, cache: PhotoCache): Promise<LoadedImage | null> => {
  const dataUrl = await loadPhoto(url, cache);

  return dataUrl ? measurePhoto(dataUrl) : null;
};

