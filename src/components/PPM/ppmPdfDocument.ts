// components/PPM/ppmPdfDocument.ts
// Descarga de fichas PPM como PDF sin pasar por el diálogo del navegador.
//
// Son tres pasos. Primero las fotos se incrustan como data URL, pidiéndolas al
// proxy de imágenes: el CDN las sirve sin cabeceras CORS, así que el navegador
// las pinta en pantalla pero no deja que JavaScript lea sus bytes, y html2canvas
// las dibujaría en blanco. Después la ficha se rasteriza de una sola vez
// —html2canvas clona el documento entero en cada llamada, y hacerlo bloque a
// bloque multiplicaba la espera por el número de tarjetas—. Por último el lienzo
// se corta por los límites de los bloques (.ppm-print-block), así ninguna tarjeta
// queda partida entre dos hojas; y cuando una tarjeta no cabe entera, el corte se
// busca entre fotos.
//
// El membrete (.ppm-print-header) es la excepción: se recorta del mismo lienzo y
// se estampa arriba en todas las hojas, que para eso es un encabezado.
//
// Si la zona imprimible trae varias fichas marcadas con .ppm-print-page —el lote
// del gestor de reportes—, cada una se captura por su cuenta y empieza en hoja
// nueva dentro del mismo archivo.
//
// El aspecto de papel lo pone .ppm-paper (ver ppmPrint.css), activa solo durante
// la captura porque html2canvas nunca evalúa las reglas de @media print.

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { waitForImages } from './waitForImages';
import { PhotoCache, loadPhoto, prefetchPhotos, warnAboutBlockedPhotos } from '../reportPhotoData';

const PAGE_WIDTH_MM = 210;
const PAGE_HEIGHT_MM = 297;
const PAGE_MARGIN_MM = 10;
const CONTENT_WIDTH_MM = PAGE_WIDTH_MM - PAGE_MARGIN_MM * 2;
const CONTENT_HEIGHT_MM = PAGE_HEIGHT_MM - PAGE_MARGIN_MM * 2;

const CAPTURE_SCALE = 2;
/** En un lote pesa más la espera que el último punto de nitidez: 1,5 son ~220 ppp. */
const BATCH_CAPTURE_SCALE = 1.5;
const IMAGE_TIMEOUT_MS = 5000;
const JPEG_QUALITY = 0.92;
/** Techos de un lienzo: el del navegador y el que aguanta la memoria. */
const MAX_CANVAS_EDGE_PX = 32000;
const MAX_CANVAS_PIXELS = 24000000;
/** Por debajo de esto, respetar una foto dejaría la hoja demasiado vacía. */
const MIN_PAGE_FILL = 0.15;
const PAPER_CLASS = 'ppm-paper';
const OFFSCREEN_CLASS = 'ppm-print-offscreen';
const BLOCK_SELECTOR = '.ppm-print-block';
const HEADER_SELECTOR = '.ppm-print-header';
const PAGE_SELECTOR = '.ppm-print-page';
/** html2canvas se salta lo marcado con este atributo. */
const IGNORE_ATTRIBUTE = 'data-html2canvas-ignore';
const HEADER_GAP_MM = 4;

// Ruta que Firebase Hosting reescribe a la función `imageProxy` y que el servidor
// de desarrollo reenvía al CDN (ver setupProxy.js). La variable de entorno solo
// hace falta si la app se sirve sin ninguno de los dos delante.
const IMAGE_PROXY_URL = process.env.REACT_APP_IMAGE_PROXY_URL || '/api/image';

/** Franja del lienzo que va a parar a una hoja, en píxeles de lienzo. */
interface SliceBounds {
  top: number;
  bottom: number;
}

/** La ficha rasterizada: el cuerpo entero y el membrete ya recortado aparte. */
interface SheetCanvases {
  body: HTMLCanvasElement;
  header: HTMLCanvasElement | null;
}

/** Una ficha del escenario, con el alto que midió mientras estuvo montada. */
interface StagedDocument {
  element: HTMLElement;
  height: number;
}

/** La copia fuera de pantalla desde la que se rasteriza. */
interface PrintStage {
  /** Lo que cuelga del body; es lo único que no se oculta durante un lote. */
  container: HTMLElement;
  sheet: HTMLElement;
  documents: StagedDocument[];
  chunks: StagedDocument[][];
  captureScale: number;
  isBatch: boolean;
  remove: () => void;
}

export interface DownloadSheetOptions {
  /** Se llama al terminar cada ficha, para poder mostrar el avance del lote. */
  onProgress?: (completed: number, total: number) => void;
}

/**
 * Rasteriza la ficha y la descarga como `<documentName>.pdf`.
 * @param sheet - Contenedor .ppm-print-area montado, sea la vista viva o una
 *   ficha montada fuera de pantalla: no se toca, se trabaja sobre una copia.
 * @param documentName - Nombre sin extensión (ver `buildPrintDocumentName`).
 */
export const downloadSheetAsPdf = async (
  sheet: HTMLElement | null,
  documentName: string,
  { onProgress }: DownloadSheetOptions = {}
): Promise<void> => {
  if (!sheet) return;

  const stage = mountPrintStage(sheet);
  const restoreApp = ignoreEverythingElse(stage);

  try {
    // Todas las fotos de golpe y en paralelo: la red se solapa y a partir de aquí
    // incrustarlas en cada ficha es leer de un mapa.
    const photoCache: PhotoCache = new Map();
    await prefetchPhotos(
      Array.from(sheet.querySelectorAll('img')).map((image) => image.src),
      photoCache
    );

    const sharedHeader = await captureDetachedHeader(stage.sheet, stage.documents);
    const doc = new jsPDF('p', 'mm', 'a4');
    let hasPages = false;
    let completed = 0;

    for (const chunk of stage.chunks) {
      mountChunk(stage, chunk);
      await inlineImages(stage.sheet, photoCache);

      const body = await captureSheet(stage.sheet, stage.captureScale);

      for (const { element } of chunk) {
        const canvases: SheetCanvases = { body, header: sharedHeader ?? cropHeader(stage.sheet, body) };
        const pages = paginateBlocks(
          measureBlocks(stage.sheet, body, element),
          toPageHeightPx(canvases),
          measurePhotos(stage.sheet, body, element)
        );

        hasPages = addPages(doc, canvases, pages, hasPages);
        onProgress?.(++completed, stage.documents.length);
      }

      unmountChunk(stage, chunk);
    }

    if (hasPages) doc.save(`${documentName}.pdf`);
  } finally {
    restoreApp();
    stage.remove();
  }
};

/**
 * Marca el resto de la página para que html2canvas se la salte. En cada llamada
 * recorre el documento entero calculando estilos nodo a nodo, así que cada ficha
 * pagaba también por el menú, la tabla del reporte y todo lo demás. Con esta
 * marca solo mira el escenario, y la aplicación ni se entera: es un atributo, no
 * un cambio de estilo, así que en pantalla no parpadea nada.
 */
const ignoreEverythingElse = (stage: PrintStage): (() => void) => {
  const ignored = Array.from(document.body.children).filter(
    (child): child is HTMLElement =>
      child instanceof HTMLElement && child !== stage.container && !child.hasAttribute(IGNORE_ATTRIBUTE)
  );

  ignored.forEach((element) => element.setAttribute(IGNORE_ATTRIBUTE, ''));

  return () => ignored.forEach((element) => element.removeAttribute(IGNORE_ATTRIBUTE));
};

/**
 * En un lote el membrete queda fuera de las fichas, así que se captura aparte
 * para poder repetirlo en todas las hojas. Cuando va dentro —una sola ficha— se
 * devuelve null y se recorta del propio cuerpo, que sale gratis.
 */
const captureDetachedHeader = async (
  sheet: HTMLElement,
  documents: StagedDocument[]
): Promise<HTMLCanvasElement | null> => {
  const [header] = collectHeader(sheet);
  if (!header || documents.some(({ element }) => element.contains(header))) return null;

  return captureSheet(header, CAPTURE_SCALE);
};

/**
 * Monta una copia de la ficha fuera de pantalla, ya con el aspecto de papel.
 * Capturar la copia y no el original tiene dos ventajas cuando lo que se exporta
 * es la vista viva: nadie ve cómo se aplana el diseño mientras se genera, y el
 * documento sale siempre al mismo ancho en vez de al de la ventana.
 *
 * En un lote, además, reparte las fichas en tandas y las desmonta: se capturan
 * varias por llamada —lo caro de html2canvas es la llamada, no el alto— sin
 * pasarse del techo de memoria de un lienzo.
 */
const mountPrintStage = (sheet: HTMLElement): PrintStage => {
  const container = document.createElement('div');
  container.className = OFFSCREEN_CLASS;

  const copy = sheet.cloneNode(true) as HTMLElement;
  copy.classList.remove(OFFSCREEN_CLASS); // de colocarla se encarga el escenario
  copy.classList.add(PAPER_CLASS);

  container.appendChild(copy);
  document.body.appendChild(container);

  const pages = Array.from(copy.querySelectorAll<HTMLElement>(PAGE_SELECTOR));
  const isBatch = pages.length > 1;
  const captureScale = isBatch ? BATCH_CAPTURE_SCALE : CAPTURE_SCALE;

  // Se miden con todo montado, que es la única vez que tienen alto.
  const documents: StagedDocument[] = (pages.length > 0 ? pages : [copy]).map((element) => ({
    element,
    height: element.offsetHeight,
  }));

  if (isBatch) documents.forEach(({ element }) => element.remove());

  return {
    container,
    sheet: copy,
    documents,
    chunks: groupIntoChunks(documents, copy.offsetWidth, captureScale),
    captureScale,
    isBatch,
    remove: () => container.remove(),
  };
};

/** Tandas que caben en un lienzo: ni más alto del máximo ni más área de la que cabe en memoria. */
const groupIntoChunks = (
  documents: StagedDocument[],
  width: number,
  captureScale: number
): StagedDocument[][] => {
  const byArea = MAX_CANVAS_PIXELS / Math.max(1, width * captureScale * captureScale);
  const maxHeight = Math.max(1, Math.min(MAX_CANVAS_EDGE_PX / captureScale, byArea));

  return documents.reduce<StagedDocument[][]>((chunks, staged) => {
    const current = chunks[chunks.length - 1];
    const currentHeight = (current ?? []).reduce((total, item) => total + item.height, 0);

    if (!current || currentHeight + staged.height > maxHeight) return [...chunks, [staged]];

    current.push(staged);
    return chunks;
  }, []);
};

/** La ficha única ya está montada: solo el lote entra y sale del escenario. */
const mountChunk = (stage: PrintStage, chunk: StagedDocument[]): void => {
  if (!stage.isBatch) return;
  chunk.forEach(({ element }) => stage.sheet.appendChild(element));
};

const unmountChunk = (stage: PrintStage, chunk: StagedDocument[]): void => {
  if (!stage.isBatch) return;
  chunk.forEach(({ element }) => element.remove());
};

/* ── Fotos ────────────────────────────────────────────────────────────────── */

/**
 * Cambia cada foto por su data URL. La que falle se deja como está.
 * @param cache - Reparte el trabajo entre las fichas de un lote: una foto que se
 *   repite (la del activo en todas sus órdenes) se descarga una sola vez.
 */
const inlineImages = async (sheet: HTMLElement, cache: PhotoCache): Promise<void> => {
  const images = Array.from(sheet.querySelectorAll('img')).filter((image) => !image.src.startsWith('data:'));

  const embedded = await Promise.all(images.map((image) => replaceSourceWithDataUrl(image, cache)));
  warnAboutBlockedPhotos(embedded.filter((wasEmbedded) => !wasEmbedded).length);

  await waitForImages(sheet);
};

const replaceSourceWithDataUrl = async (image: HTMLImageElement, cache: PhotoCache): Promise<boolean> => {
  const dataUrl = await loadPhoto(image.src, cache);
  if (!dataUrl) return false;

  image.src = dataUrl;
  return true;
};

/* ── Captura y paginación ─────────────────────────────────────────────────── */

const captureSheet = (sheet: HTMLElement, scale: number): Promise<HTMLCanvasElement> =>
  html2canvas(sheet, {
    scale,
    useCORS: true,
    backgroundColor: '#ffffff',
    imageTimeout: IMAGE_TIMEOUT_MS,
    logging: false,
  });

/**
 * Recorta el membrete del propio lienzo, en vez de capturarlo por su cuenta:
 * html2canvas clona el documento entero en cada llamada, y aquí sale gratis y
 * pintado exactamente igual que el resto de la ficha.
 */
const cropHeader = (sheet: HTMLElement, canvas: HTMLCanvasElement): HTMLCanvasElement | null => {
  const [band] = measureElements(sheet, canvas, collectHeader(sheet));
  if (!band || band.bottom <= band.top) return null;

  return cropCanvas(canvas, band.top, band.bottom - band.top);
};

/**
 * Sitúa los bloques de una ficha dentro del lienzo. Los anidados viajan con su
 * tarjeta.
 * @param origin - Lo que se capturó, que es el cero de las coordenadas.
 * @param scope - La ficha que se está paginando; en una tanda, una de varias.
 */
const measureBlocks = (
  origin: HTMLElement,
  canvas: HTMLCanvasElement,
  scope: HTMLElement
): SliceBounds[] => {
  const blocks = measureElements(origin, canvas, collectTopLevelBlocks(scope));
  if (blocks.length > 0) return blocks;

  // Una ficha sin bloques marcados se reparte en tajadas, pero por debajo del
  // membrete: ese ya se estampa aparte en cada hoja.
  const [bounds] = measureElements(origin, canvas, [scope]);
  const [header] = measureElements(origin, canvas, collectHeader(scope));

  return [{ top: header ? header.bottom : bounds.top, bottom: bounds.bottom }];
};

/**
 * Las fotos son lo que no se debe partir al cortar un bloque demasiado alto. El
 * logo del membrete queda fuera: no viaja en el cuerpo del documento.
 */
const measurePhotos = (
  origin: HTMLElement,
  canvas: HTMLCanvasElement,
  scope: HTMLElement
): SliceBounds[] => {
  const photos = Array.from(scope.querySelectorAll('img')).filter((photo) => !photo.closest(HEADER_SELECTOR));

  return measureElements(origin, canvas, photos);
};

const measureElements = (
  sheet: HTMLElement,
  canvas: HTMLCanvasElement,
  elements: HTMLElement[]
): SliceBounds[] => {
  const sheetBounds = sheet.getBoundingClientRect();
  if (sheetBounds.width === 0) return [];

  const pixelsPerScreenPixel = canvas.width / sheetBounds.width;

  return elements.map((element) => {
    const bounds = element.getBoundingClientRect();
    return {
      top: Math.max(0, Math.round((bounds.top - sheetBounds.top) * pixelsPerScreenPixel)),
      bottom: Math.min(canvas.height, Math.round((bounds.bottom - sheetBounds.top) * pixelsPerScreenPixel)),
    };
  });
};

const collectTopLevelBlocks = (sheet: HTMLElement): HTMLElement[] => {
  const blocks = Array.from(sheet.querySelectorAll<HTMLElement>(BLOCK_SELECTOR));
  return blocks.filter((block) => !blocks.some((other) => other !== block && other.contains(block)));
};

const collectHeader = (sheet: HTMLElement): HTMLElement[] =>
  Array.from(sheet.querySelectorAll<HTMLElement>(HEADER_SELECTOR));

/** Reparte los bloques en hojas, sin cortar ninguno salvo que no quepa entero. */
const paginateBlocks = (blocks: SliceBounds[], pageHeightPx: number, photos: SliceBounds[]): SliceBounds[] => {
  if (pageHeightPx <= 0) return [];

  const pages: SliceBounds[] = [];
  let page: SliceBounds | null = null;

  for (const block of blocks) {
    if (page && block.bottom - page.top > pageHeightPx) {
      pages.push(page);
      page = null;
    }

    page = page ? { top: page.top, bottom: block.bottom } : { ...block };

    // Un bloque más alto que la hoja (checklists largos, muros de fotos) es el
    // único que se parte, y el corte se busca entre fotos, no a través de una.
    while (page.bottom - page.top > pageHeightPx) {
      const cut = cutBetweenPhotos(page.top + pageHeightPx, page.top, photos);
      pages.push({ top: page.top, bottom: cut });
      page = { top: cut, bottom: page.bottom };
    }
  }

  if (page && page.bottom > page.top) pages.push(page);

  return pages;
};

/**
 * Sube el corte hasta el borde superior de la foto que iba a atravesar. Las
 * fotos vienen del móvil y son altas: sin esto, una evidencia acabaría partida
 * entre dos hojas.
 *
 * Hay dos casos en los que se corta igualmente. Si la foto arranca por encima
 * del inicio de la página, ella sola ocupa más de un folio y no hay corte que
 * la salve. Y si arranca en los primeros centímetros, respetarla dejaría una
 * hoja casi en blanco: sale peor el remedio.
 */
const cutBetweenPhotos = (cut: number, pageTop: number, photos: SliceBounds[]): number => {
  const crossed = photos.find((photo) => photo.top < cut && photo.bottom > cut);
  if (!crossed || crossed.top <= pageTop) return cut;

  const filledPage = (crossed.top - pageTop) / (cut - pageTop);

  return filledPage >= MIN_PAGE_FILL ? crossed.top : cut;
};

/**
 * Vuelca las hojas de una ficha en el documento.
 * @param hasPages - Si el documento ya traía hojas de una ficha anterior.
 * @returns Si el documento tiene hojas al terminar.
 */
const addPages = (
  doc: jsPDF,
  { body, header }: SheetCanvases,
  pages: SliceBounds[],
  hasPages: boolean
): boolean => {
  // El membrete se codifica una sola vez aunque se repita en todas las hojas.
  const headerImage = header ? toJpeg(header) : null;
  const headerImageHeightMm = header ? toHeightMm(header) : 0;
  const contentTopMm = PAGE_MARGIN_MM + toHeaderHeightMm(header);
  let written = hasPages;

  pages.forEach((page) => {
    if (written) doc.addPage();
    written = true;

    if (headerImage) {
      doc.addImage(headerImage, 'JPEG', PAGE_MARGIN_MM, PAGE_MARGIN_MM, CONTENT_WIDTH_MM, headerImageHeightMm);
    }

    const slice = cropCanvas(body, page.top, page.bottom - page.top);
    doc.addImage(toJpeg(slice), 'JPEG', PAGE_MARGIN_MM, contentTopMm, CONTENT_WIDTH_MM, toHeightMm(slice));
  });

  return written;
};

const toJpeg = (canvas: HTMLCanvasElement): string => canvas.toDataURL('image/jpeg', JPEG_QUALITY);

const cropCanvas = (source: HTMLCanvasElement, offsetPx: number, heightPx: number): HTMLCanvasElement => {
  const slice = document.createElement('canvas');
  slice.width = source.width;
  slice.height = heightPx;

  const context = slice.getContext('2d');
  if (context) {
    // Sin fondo propio, el JPEG pintaría de negro lo que quede transparente.
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, slice.width, slice.height);
    context.drawImage(source, 0, offsetPx, source.width, heightPx, 0, 0, source.width, heightPx);
  }

  return slice;
};

/** Alto de hoja útil una vez descontado el membrete, en píxeles del lienzo. */
const toPageHeightPx = ({ body, header }: SheetCanvases): number => {
  const availableHeightMm = CONTENT_HEIGHT_MM - toHeaderHeightMm(header);

  return Math.floor((availableHeightMm / CONTENT_WIDTH_MM) * body.width);
};

/** Lo que el membrete le quita a cada hoja, con su separación del contenido. */
const toHeaderHeightMm = (header: HTMLCanvasElement | null): number =>
  header ? toHeightMm(header) + HEADER_GAP_MM : 0;

/** Alto que ocupa una franja al escalarla al ancho útil de la hoja. */
const toHeightMm = (canvas: HTMLCanvasElement): number => (canvas.height / canvas.width) * CONTENT_WIDTH_MM;
