// components/PPM/waitForImages.ts
// Las fichas imprimibles se montan fuera de pantalla y se mandan a imprimir de
// inmediato: si las fotos de Storage aún no han llegado, el papel sale con
// huecos. Esta espera evita el retardo fijo "a ojo" antes de `window.print()`.

const DEFAULT_TIMEOUT_MS = 8000;

/**
 * Resuelve cuando todas las imágenes del contenedor terminaron de cargar (o de
 * fallar). Nunca rechaza: el techo de tiempo garantiza que la impresión siga
 * adelante aunque una foto se quede colgada.
 */
export const waitForImages = (container: HTMLElement | null, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<void> => {
  if (!container) return Promise.resolve();

  // `complete` ya cubre tanto la carga correcta como el error.
  const pending = Array.from(container.querySelectorAll('img')).filter((image) => !image.complete);
  if (pending.length === 0) return Promise.resolve();

  return Promise.race([
    Promise.all(pending.map(whenSettled)).then(() => undefined),
    delay(timeoutMs),
  ]);
};

const whenSettled = (image: HTMLImageElement): Promise<void> =>
  new Promise((resolve) => {
    const finish = () => {
      image.removeEventListener('load', finish);
      image.removeEventListener('error', finish);
      resolve();
    };

    image.addEventListener('load', finish);
    image.addEventListener('error', finish);
  });

const delay = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));
