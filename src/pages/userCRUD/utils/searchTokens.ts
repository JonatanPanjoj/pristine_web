/**
 * searchTokens.ts
 *
 * Genera tokens de búsqueda para guardar en Firestore y hacer búsquedas
 * eficientes con `array-contains`.
 *
 * ¿Por qué tokens y no prefix-search directo?
 * ─────────────────────────────────────────────
 * Firestore solo soporta búsqueda de PREFIJO sobre un campo:
 *   name >= "jos" AND name <= "jos\uf8ff"
 * Eso solo encuentra "Jose Rodriguez" si escribes "Jose", nunca si escribes
 * "Rodriguez". Con tokens, se indexan los prefijos de CADA PALABRA por separado,
 * y `array-contains` encuentra cualquier término.
 *
 * Ejemplo — "José Rodríguez García":
 *   tokens = ["j","jo","jos","jose", "r","ro","rod","rodr","rodri",...,"rodriguez",
 *             "g","ga","gar","garci","garcia",
 *             "garcia rodriguez", ...emails, ...usernames]
 *
 * Costo:
 *   Escritura: se calcula UNA VEZ al crear o editar el usuario.
 *   Lectura:   1 query `array-contains` = pageSize lecturas máx. Sin paralelas.
 *
 * Índice Firestore necesario:
 *   El índice de `search_tokens` (array) se crea AUTOMÁTICAMENTE por Firebase.
 *   Para filtrar también por rol: crear índice compuesto manualmente:
 *     Colección: users | Campos: rol (ASC) + search_tokens (Arrays)
 */

// ── Normalización ─────────────────────────────────────────────────────────────

/**
 * Normaliza texto para búsqueda:
 * - Convierte a minúsculas
 * - Elimina acentos y diacríticos (á→a, é→e, ñ→n, ü→u, etc.)
 * - Elimina caracteres no alfanuméricos excepto @ y . (para emails)
 * - Colapsa espacios múltiples
 */
export const normalizeText = (text: string): string => {
  if (!text) return '';
  return text
    .normalize('NFD')                          // descompone caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '')           // elimina los diacríticos separados
    .toLowerCase()
    .replace(/[^a-z0-9@._\s]/g, '')           // solo alfanuméricos, @, punto, espacio
    .replace(/\s+/g, ' ')
    .trim();
};

// ── Generador de tokens ───────────────────────────────────────────────────────

const MIN_TOKEN_LENGTH = 2;  // Ignorar tokens de 1 carácter (demasiados falsos positivos)
const MAX_TOKEN_LENGTH = 20; // Limitar tokens muy largos (nadie tipea 20 chars de corrido)

/**
 * Genera prefijos de una palabra: "rodriguez" → ["ro","rod","rodr",..."rodriguez"]
 */
const prefixesOfWord = (word: string): string[] => {
  const tokens: string[] = [];
  for (let i = MIN_TOKEN_LENGTH; i <= Math.min(word.length, MAX_TOKEN_LENGTH); i++) {
    tokens.push(word.slice(0, i));
  }
  return tokens;
};

/**
 * Genera todos los tokens de búsqueda para un campo de texto.
 *
 * Estrategia:
 *  1. Normalizar el texto completo.
 *  2. Dividir en palabras.
 *  3. Para cada palabra, generar todos sus prefijos.
 *  4. Incluir el texto completo normalizado (para búsqueda exacta).
 *
 * "Jose Rodriguez Garcia" →
 *   palabras: ["jose", "rodriguez", "garcia"]
 *   tokens:   ["jo","jos","jose",  "ro","rod",...,"rodriguez",  "ga","gar",...,"garcia",
 *              "jose rodriguez garcia"]
 */
const tokensFromText = (text: string): string[] => {
  const normalized = normalizeText(text);
  if (!normalized) return [];

  const words  = normalized.split(' ').filter((w) => w.length >= MIN_TOKEN_LENGTH);
  const tokens = new Set<string>();

  words.forEach((word) => {
    prefixesOfWord(word).forEach((t) => tokens.add(t));
  });

  // Incluir el texto completo normalizado (para match exacto del nombre completo)
  if (normalized.length >= MIN_TOKEN_LENGTH) {
    tokens.add(normalized);
  }

  return Array.from(tokens);
};

// ── API pública ───────────────────────────────────────────────────────────────

/**
 * Genera el array `search_tokens` a partir de los campos del usuario.
 *
 * Campos indexados:
 *  - name  (nombre completo)
 *  - user  (nombre de usuario / login)
 *  - email (correo — tokenizado por partes: usuario + dominio)
 *
 * El array resultante se guarda en Firestore y permite búsqueda eficiente
 * con `where('search_tokens', 'array-contains', searchTerm)`.
 *
 * @example
 * generateSearchTokens({ name: "José Rodríguez", user: "jrodriguez", email: "j@empresa.com" })
 * // → ["jo","jos","jose","jr","jro","jrodr",...,"jose rodriguez","jrodriguez","j","empresa"]
 */
export const generateSearchTokens = (fields: {
  name?: string;
  user?: string;
  email?: string;
}): string[] => {
  const allTokens = new Set<string>();

  // Tokens del nombre completo
  tokensFromText(fields.name ?? '').forEach((t) => allTokens.add(t));

  // Tokens del username
  tokensFromText(fields.user ?? '').forEach((t) => allTokens.add(t));

  // Tokens del email — dividir en parte local y dominio por separado
  if (fields.email) {
    const [local, domain] = fields.email.split('@');
    tokensFromText(local  ?? '').forEach((t) => allTokens.add(t));
    tokensFromText(domain ?? '').forEach((t) => allTokens.add(t));
    // El email completo normalizado
    const emailNorm = normalizeText(fields.email);
    if (emailNorm) allTokens.add(emailNorm);
  }

  return Array.from(allTokens);
};

/**
 * Normaliza el término de búsqueda del usuario para comparar con los tokens.
 * Siempre usar esto antes de llamar a Firestore.
 *
 * @example
 * normalizeSearchTerm("Ródríguez") → "rodriguez"
 * normalizeSearchTerm("  JOSE  ")  → "jose"
 */
export const normalizeSearchTerm = (term: string): string => {
  return normalizeText(term);
};