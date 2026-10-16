// components/reportPhotoData.ts
// Lectura de las fotos para meterlas en un PDF. Lo comparten todos los informes
// que incrustan imágenes: las fichas PPM, los reportes de Help Desk y la ficha de
// un ticket.
//
// El CDN guarda una sola copia de cada foto, la que se pidió sin cabecera Origin,
// y la devuelve sin `Access-Control-Allow-Origin`: el navegador la pinta pero no
// deja que JavaScript lea sus bytes, y sin bytes no hay nada que incrustar. Por
// eso las fotos se piden al proxy, que las lee desde el servidor y las devuelve
// con CORS abierto. El intento directo queda de reserva por si algún día el
// origen empieza a responder con las cabeceras puestas.

// Ruta que Firebase Hosting reescribe a la función `imageProxy` y que el servidor
// de desarrollo reenvía al CDN (ver setupProxy.js). La variable de entorno solo
// hace falta si la app se sirve sin ninguno de los dos delante.
const IMAGE_PROXY_URL = process.env.REACT_APP_IMAGE_PROXY_URL || '/api/image';

/** Lado máximo de una foto incrustada: en A4 ninguna se pinta más grande. */
const MAX_PHOTO_EDGE_PX = 1000;
/** Reducir una foto ya pequeña cuesta más que dejarla como está. */
const SMALL_PHOTO_BYTES = 150 * 1024;
const JPEG_QUALITY = 0.92;

/**
 * Lo único que jsPDF sabe incrustar. Los móviles ya suben AVIF y WEBP, que el
 * navegador pinta sin problema pero el PDF rechaza: esas se reconvierten a JPEG,
 * porque si no `addImage` lanza y la foto desaparece del documento.
 */
const EMBEDDABLE_TYPES = ['image/jpeg', 'image/png'];

/** Fotos ya leídas, por URL de origen. Una foto repetida se descarga una vez. */
export type PhotoCache = Map<string, string | null>;

/**
 * Descarga todas las fotos a la vez y las deja listas en el mapa. Pedirlas ficha
 * a ficha encadenaba las esperas en lugar de solaparlas.
 */
export const prefetchPhotos = async (sources: string[], cache: PhotoCache): Promise<void> => {
  const pending = Array.from(new Set(sources)).filter((src) => src && !src.startsWith('data:') && !cache.has(src));

  await Promise.all(
    pending.map(async (src) => {
      cache.set(src, await readImageAsDataUrl(src));
    })
  );
};

/** Una foto ya leída, con el tamaño que necesita quien la va a maquetar. */
export interface MeasuredPhoto {
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Mide la foto ya incrustada. Una data URL no tiene origen que validar, así que
 * descodificarla nunca falla por CORS.
 */
export const measurePhoto = (dataUrl: string): Promise<MeasuredPhoto> =>
  new Promise((resolve) => {
    const image = new Image();
    const fallback = { dataUrl, width: 400, height: 300 };

    image.onload = () => resolve({ dataUrl, width: image.naturalWidth || 400, height: image.naturalHeight || 300 });
    image.onerror = () => resolve(fallback);
    image.src = dataUrl;
  });

/** La foto como data URL, o null si no se pudo leer. Nunca lanza. */
export const loadPhoto = async (url: string, cache: PhotoCache): Promise<string | null> => {
  if (url.startsWith('data:')) return url;
  if (!cache.has(url)) cache.set(url, await readImageAsDataUrl(url));

  return cache.get(url) ?? null;
};

/** Sin esta cuenta el documento saldría con huecos y sin explicación. */
export const warnAboutBlockedPhotos = (count: number): void => {
  if (count === 0) return;

  console.warn(
    `[reportPhotoData] ${count} foto(s) saldrán en blanco: no se pudieron leer ni por el proxy (${IMAGE_PROXY_URL}) ni directamente.`
  );
};

const readImageAsDataUrl = async (url: string): Promise<string | null> => {
  if (isSameOrigin(url)) return fetchAsDataUrl(url);

  return (await fetchAsDataUrl(toProxyUrl(url))) ?? (await fetchAsDataUrl(url));
};

const toProxyUrl = (url: string): string => `${IMAGE_PROXY_URL}?url=${encodeURIComponent(url)}`;

const isSameOrigin = (url: string): boolean => {
  try {
    return new URL(url, window.location.href).origin === window.location.origin;
  } catch {
    return false;
  }
};

/** Nunca lanza: una foto menos no aborta el documento. */
const fetchAsDataUrl = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    return await toPrintableDataUrl(await response.blob());
  } catch {
    return null;
  }
};

/**
 * Reduce la foto antes de incrustarla. Las toma el técnico con el móvil, así que
 * pueden llegar a 12 megapíxeles para pintarse en un recuadro de tres
 * centímetros. Al ancho de una hoja no se nota la diferencia.
 */
const toPrintableDataUrl = async (blob: Blob): Promise<string | null> => {
  const isEmbeddable = EMBEDDABLE_TYPES.includes(blob.type);

  // Las fotos del catálogo rondan las decenas de kilobytes: descodificarlas para
  // comprobar que ya son pequeñas cuesta más que el trabajo que ahorraría.
  if (isEmbeddable && blob.size <= SMALL_PHOTO_BYTES) return readAsDataUrl(blob);

  const objectUrl = URL.createObjectURL(blob);
  try {
    const image = await decodeImage(objectUrl);
    // Un formato que el PDF no admite y que además no se pudo descodificar no
    // tiene salida: mejor contarlo como bloqueada que colar bytes que romperán.
    if (!image) return isEmbeddable ? readAsDataUrl(blob) : null;

    const scale = Math.min(1, MAX_PHOTO_EDGE_PX / Math.max(image.naturalWidth, image.naturalHeight));
    if (isEmbeddable && scale === 1) return readAsDataUrl(blob);

    return toScaledJpeg(image, scale) ?? (isEmbeddable ? await readAsDataUrl(blob) : null);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

/** Anunciar a jsPDF un formato que no es el del archivo hace que falle. */
export const photoFormat = (dataUrl: string): string =>
  dataUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG';

const toScaledJpeg = (image: HTMLImageElement, scale: number): string | null => {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(image.naturalWidth * scale);
  canvas.height = Math.round(image.naturalHeight * scale);

  const context = canvas.getContext('2d');
  if (!context) return null;

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
};

// Se descodifica con una <img> y no con createImageBitmap porque la etiqueta sí
// respeta la orientación EXIF: las fotos verticales del móvil saldrían tumbadas.
const decodeImage = (objectUrl: string): Promise<HTMLImageElement | null> =>
  new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = objectUrl;
  });

const readAsDataUrl = (blob: Blob): Promise<string | null> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(blob);
  });
