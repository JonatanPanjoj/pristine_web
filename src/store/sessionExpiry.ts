// store/sessionExpiry.ts
// Política de vencimiento de la sesión, en un solo sitio.
//
// El estado persistido lleva una marca de tiempo que `customStorage` escribe en
// cada guardado. Antes solo se leía al rehidratar, así que una sesión vencida
// pasaba inadvertida hasta recargar la página; exportar aquí el cálculo permite
// que además se vigile en vivo mientras la app está abierta.

/** Duración de la sesión: 20 minutos desde el último guardado del estado. */
export const EXPIRATION_TIME = 20 * 1000 * 60;

/** Clave que redux-persist usa para `persistConfig.key = 'root'`. */
const PERSIST_KEY = 'persist:root';

export const readSessionTimestamp = (): number | null => {
  try {
    const raw = window.localStorage.getItem(PERSIST_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return typeof parsed?.timestamp === 'number' ? parsed.timestamp : null;
  } catch {
    // Un estado corrupto se trata como inexistente: no hay sesión que vigilar.
    return null;
  }
};

/** Milisegundos que le quedan a la sesión, o null si no hay ninguna guardada. */
export const millisecondsUntilExpiry = (now: number = Date.now()): number | null => {
  const timestamp = readSessionTimestamp();
  return timestamp === null ? null : timestamp + EXPIRATION_TIME - now;
};

export const isSessionExpired = (now: number = Date.now()): boolean => {
  const remaining = millisecondsUntilExpiry(now);
  return remaining !== null && remaining <= 0;
};
