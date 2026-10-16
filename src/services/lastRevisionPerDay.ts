// services/lastRevisionPerDay.ts
// Una revisión por programación y día: la última.
//
// El sistema anterior duplica revisiones. En Metronorte, el jueves 24, hay 62
// revisiones para 46 programaciones, y el patrón se repite: dos registros con un
// segundo de diferencia, el primero con las respuestas en blanco y el segundo con
// las buenas.
//
//   prog #4231  rev 982698  13:17:32  2 respuestas, 0 sí
//   prog #4231  rev 982702  13:17:34  2 respuestas, 2 sí
//
// Contando las dos, cada "no" del intento fallido cuenta como incumplimiento y el
// total de respuestas sale al doble. Por eso se descarta todo menos la última, y
// se hace aquí y no en cada pantalla: el tablero, la ficha del día y los reportes
// tienen que contar lo mismo.

import { ChecklistRevision } from "../models/ChecklistRevision";

/** Clave del día en hora local. En UTC el día cambia de madrugada en Guatemala. */
export const dayKeyOf = (isoDate: string): string => {
  const date = new Date(isoDate);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
};

/**
 * Parte numérica del id (`chkrev_982702` → 982702).
 *
 * Hace falta como desempate: las dos revisiones duplicadas pueden traer la misma
 * marca de tiempo al segundo, y entonces la fecha no distingue cuál fue después.
 */
const sequenceOf = (id: string): number => {
  const digits = /(\d+)\s*$/.exec(id || "");
  return digits ? Number(digits[1]) : 0;
};

/** Si `candidate` es posterior a `current`. */
const isNewer = (candidate: ChecklistRevision, current: ChecklistRevision): boolean => {
  const byDate = (candidate.startDate || "").localeCompare(current.startDate || "");
  if (byDate !== 0) return byDate > 0;
  return sequenceOf(candidate.id) > sequenceOf(current.id);
};

/**
 * Se queda con la última revisión de cada programación en cada día.
 * @param revisions Revisiones tal como vienen de Firestore.
 * @returns Una por programación y día, la más reciente.
 */
export const lastRevisionPerDay = (revisions: ChecklistRevision[]): ChecklistRevision[] =>
  Array.from(indexLastRevisions(revisions).values());

/**
 * Lo mismo, pero indexado por `"scheduleId::YYYY-MM-DD"`, que es como lo consultan
 * las pantallas que recorren el calendario día a día.
 */
export const indexLastRevisions = (
  revisions: ChecklistRevision[]
): Map<string, ChecklistRevision> => {
  const byKey = new Map<string, ChecklistRevision>();

  revisions.forEach((revision) => {
    if (!revision.startDate) return;

    const key = `${revision.scheduleId}::${dayKeyOf(revision.startDate)}`;
    const current = byKey.get(key);
    if (!current || isNewer(revision, current)) byKey.set(key, revision);
  });

  return byKey;
};
