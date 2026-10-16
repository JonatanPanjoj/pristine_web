// components/PPM/ppmPrintDocument.ts
// El navegador toma el nombre del archivo de "Guardar como PDF" de document.title.
// Aquí se arma ese nombre (código del registro + fecha y hora en que se generó) y
// se restaura el título original en cuanto se cierra el diálogo de impresión.

const INVALID_FILENAME_CHARS = /[\\/:*?"<>|]+/g;

/**
 * Nombre del documento impreso: `OT-9f2c_2026-08-14_1432`.
 * @param prefix - Familia del documento (OT, REV, FICHA…).
 * @param code - Código del registro que se imprime.
 */
export const buildPrintDocumentName = (prefix: string, code: string, when: Date = new Date()): string =>
  `${prefix}-${code}_${formatStamp(when)}`.replace(INVALID_FILENAME_CHARS, '-');

/** Lanza el diálogo de impresión con un nombre de archivo propio, si se indica. */
export const printDocument = (documentName?: string): void => {
  if (!documentName) {
    window.print();
    return;
  }

  const originalTitle = document.title;
  const restoreTitle = () => {
    document.title = originalTitle;
    window.removeEventListener('afterprint', restoreTitle);
    window.removeEventListener('focus', restoreTitle);
  };

  document.title = documentName;
  // `afterprint` es lo normal; el foco es la red de seguridad para los navegadores
  // que no lo disparan al cancelar el diálogo.
  window.addEventListener('afterprint', restoreTitle);
  window.addEventListener('focus', restoreTitle);

  window.print();
};

const formatStamp = (when: Date): string => {
  const pad = (value: number): string => String(value).padStart(2, '0');
  const day = `${when.getFullYear()}-${pad(when.getMonth() + 1)}-${pad(when.getDate())}`;
  return `${day}_${pad(when.getHours())}${pad(when.getMinutes())}`;
};
