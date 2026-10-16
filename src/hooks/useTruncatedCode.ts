import { useMemo } from 'react';

const ELLIPSIS = '…';
const DEFAULT_EDGE_CHARS = 4;
const DEFAULT_SUFFIX_CHARS = 4;

/**
 * 'edges'  → abc1…f9k2  (inicio + final, ideal para comparar IDs de un vistazo)
 * 'suffix' → …f9k2       (solo el final, para líneas secundarias)
 * 'chip'   → f9k2        (los últimos caracteres sin elipsis, para espacios muy compactos)
 */
export type TruncatedCodeMode = 'edges' | 'suffix' | 'chip';

export interface TruncatedCodeOptions {
  mode?: TruncatedCodeMode;
  edgeChars?: number;
  suffixChars?: number;
}

/**
 * Acorta IDs opacos (nanoid, longitud variable) solo para presentación: el valor
 * completo nunca se pierde, quien llama sigue teniendo `value` para copiar o buscar.
 */
export const useTruncatedCode = (value: string, options?: TruncatedCodeOptions): string => {
  const { mode = 'edges', edgeChars = DEFAULT_EDGE_CHARS, suffixChars = DEFAULT_SUFFIX_CHARS } = options ?? {};

  return useMemo(() => truncateCode(value, mode, edgeChars, suffixChars), [value, mode, edgeChars, suffixChars]);
};

const truncateCode = (value: string, mode: TruncatedCodeMode, edgeChars: number, suffixChars: number): string => {
  if (!value) return '';

  if (mode === 'edges') return truncateByEdges(value, normalizeCharCount(edgeChars, DEFAULT_EDGE_CHARS));

  const tailLength = normalizeCharCount(suffixChars, DEFAULT_SUFFIX_CHARS);
  const tail = value.slice(-tailLength);

  if (mode === 'chip') return tail;
  return value.length <= tailLength ? value : `${ELLIPSIS}${tail}`;
};

const truncateByEdges = (value: string, edgeChars: number): string => {
  // Truncar solo tiene sentido si oculta más caracteres de los que cuesta la elipsis.
  if (value.length <= edgeChars * 2 + ELLIPSIS.length) return value;
  return `${value.slice(0, edgeChars)}${ELLIPSIS}${value.slice(-edgeChars)}`;
};

const normalizeCharCount = (requested: number, fallback: number): number =>
  Number.isFinite(requested) && requested > 0 ? Math.floor(requested) : fallback;
