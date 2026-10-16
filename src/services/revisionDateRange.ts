// services/revisionDateRange.ts
// Consultar revisiones por fecha cuando conviven varios formatos de fecha.
//
// `startDate` es un string, y Firestore lo compara como texto, no como fecha. En
// esta base conviven dos formatos para el mismo instante:
//
//   "2026-09-25T06:00:00.000-06:00"   lo escribe la aplicación móvil
//   "2026-09-25T12:00:00.000Z"        lo escribe la Cloud Function
//
// Al comparar como texto, `-` va antes que `Z`, así que una revisión con desfase
// explícito queda por debajo del inicio del rango y la consulta la descarta. En
// pantalla sale "Sin revisión" aunque la revisión exista y esté completada.
//
// La solución no es elegir un formato —la app móvil no se controla desde aquí—
// sino pedir a Firestore un rango holgado y afinar en memoria, donde las fechas
// ya se comparan como fechas y los dos formatos se entienden igual.

/** Margen de la consulta. Un día cubre cualquier desfase horario del mundo. */
const MARGEN_MS = 24 * 60 * 60 * 1000;

export interface RangoDeConsulta {
  /** Límite inferior que se manda a Firestore, holgado a propósito. */
  desde: string;
  /** Límite superior que se manda a Firestore, holgado a propósito. */
  hasta: string;
}

/**
 * Límites holgados para la consulta.
 * @param inicio Principio del rango que de verdad interesa.
 * @param fin Final del rango que de verdad interesa.
 */
export const rangoDeConsulta = (inicio: Date, fin: Date): RangoDeConsulta => ({
  desde: new Date(inicio.getTime() - MARGEN_MS).toISOString(),
  hasta: new Date(fin.getTime() + MARGEN_MS).toISOString(),
});

/**
 * Si la fecha cae de verdad dentro del rango, comparando instantes.
 * @param fecha Valor de `startDate` tal como viene de Firestore.
 * @param inicio Principio del rango.
 * @param fin Final del rango.
 */
export const dentroDelRango = (fecha: string, inicio: Date, fin: Date): boolean => {
  const instante = new Date(fecha).getTime();
  if (Number.isNaN(instante)) return false;
  return instante >= inicio.getTime() && instante <= fin.getTime();
};
