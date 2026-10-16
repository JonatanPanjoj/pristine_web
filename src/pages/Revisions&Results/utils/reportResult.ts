// utils/reportResult.ts
// Transporte del "resultado" de un reporte a una pestaña nueva. El reporte
// normaliza su resultado a una matriz { headers, rows, footer? }, lo guarda en
// localStorage bajo un id y abre la vista standalone que lo lee y lo renderiza.
// Se usa localStorage (no sessionStorage) porque la pestaña nueva es otro
// contexto y debe poder leer el payload escrito por la pestaña original.

export interface ReportPayloadPhoto {
  url: string;
  title: string;
  meta: string;
}

export interface ReportPhotoSetPayload {
  /** Columna de la tabla a la que pertenece el conjunto. */
  columnIndex: number;
  label: string;
  /** Fotos de cada fila, en el mismo orden que `rows`. */
  photosByRow: string[][];
}

export interface ReportResultPayload {
  title: string;
  subtitle?: string;
  headers: string[];
  rows: (string | number)[][];
  footer?: (string | number)[];
  // Índice de la columna que contiene fotografías, para pintarlas como miniatura
  // en vez de como URL, y la lista de fotos con su contexto para la galería.
  photoColumnIndex?: number;
  photos?: ReportPayloadPhoto[];
  // Conjuntos de fotos: uno por columna de fotografía, con sus fotos fila a fila.
  // Cuando vienen, cada celda abre la galería de SU conjunto y SU fila.
  photoSets?: ReportPhotoSetPayload[];
  createdAt: number;
}

const KEY_PREFIX = 'report-result:';
const MAX_AGE_MS = 60 * 60 * 1000; // 1 hora

// ISO string o Firestore Timestamp legacy → string legible
export const convertTimestamp = (ts: any): string => {
  if (ts === null || ts === undefined || ts === '') return '—';
  if (typeof ts === 'string') {
    const d = new Date(ts);
    return isNaN(d.getTime()) ? ts : d.toLocaleString('es-GT');
  }
  if (ts?.seconds) return new Date(ts.seconds * 1000).toLocaleString('es-GT');
  return String(ts);
};

const generateId = (): string =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const cleanupOldResults = (): void => {
  const now = Date.now();
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith(KEY_PREFIX)) continue;
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || '{}');
      if (!parsed.createdAt || now - parsed.createdAt > MAX_AGE_MS) localStorage.removeItem(key);
    } catch {
      localStorage.removeItem(key);
    }
  }
};

// Guarda el payload y devuelve su id para construir la URL de la pestaña nueva
export const saveReportResult = (payload: Omit<ReportResultPayload, 'createdAt'>): string => {
  cleanupOldResults();
  const id = generateId();
  const full: ReportResultPayload = { ...payload, createdAt: Date.now() };
  localStorage.setItem(KEY_PREFIX + id, JSON.stringify(full));
  return id;
};

export const readReportResult = (id: string): ReportResultPayload | null => {
  const raw = localStorage.getItem(KEY_PREFIX + id);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ReportResultPayload;
  } catch {
    return null;
  }
};
