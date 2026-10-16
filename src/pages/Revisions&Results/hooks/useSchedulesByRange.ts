// hooks/useSchedulesByRange.ts
// Programaciones y su ejecución para el periodo elegido (día, semana o mes).
//
// La tabla se mantiene al día sola. La primera versión de esto volvía a consultar
// todo con cada cambio, y la pantalla se vaciaba y se rearmaba entera: para quien
// mira, la aplicación parpadea y parece que se ha roto. Ahora un cambio toca
// **solo la fila que le corresponde** y el resto ni se entera.

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { FIRESTORE_COLLECTIONS } from '../../../constants/firestoreCollections';
import { ChecklistRevision } from '../../../models/ChecklistRevision';
import { atStartOfDay, atEndOfDay } from '../utils/dateRange';
import { rangoDeConsulta, dentroDelRango } from '../../../services/revisionDateRange';
import { dayKeyOf } from '../../../services/lastRevisionPerDay';
import {
  getSchedulesByRangeAdapter,
  GetSchedulesByRangeParams,
  ScheduleOccurrence,
  resolveStatus,
  countAnswers,
} from '../adapters/getSchedulesByRangeAdapter';

export const useSchedulesByRange = () => {
  const [data, setData] = useState<ScheduleOccurrence[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /** Lo último que se buscó, para saber a qué rango hay que escuchar. */
  const [watched, setWatched] = useState<GetSchedulesByRangeParams | null>(null);

  const fetchRange = useCallback(async (params: GetSchedulesByRangeParams) => {
    setLoading(true);
    setError(null);
    setWatched(params);

    try {
      setData(await getSchedulesByRangeAdapter(params));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las programaciones.');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useLiveUpdates(watched, setData);

  return { data, loading, error, fetchRange };
};

/**
 * Mantiene la tabla al día sin volver a consultarla.
 *
 * Firestore dice exactamente **qué documentos** cambiaron, así que se aprovecha:
 * de cada revisión que llega se recalcula su fila y se deja el resto intacto. No
 * hay estado de carga, no hay salto, y como el array conserva las demás
 * referencias, React solo vuelve a pintar lo que de verdad cambió.
 *
 * Escucha únicamente el rango consultado: se paga la primera lectura y después
 * solo los documentos que cambian.
 */
const useLiveUpdates = (
  watched: GetSchedulesByRangeParams | null,
  setData: React.Dispatch<React.SetStateAction<ScheduleOccurrence[] | null>>
) => {
  const setDataRef = useRef(setData);
  setDataRef.current = setData;

  // Los límites que se mandan a Firestore van holgados: `startDate` es texto y
  // conviven dos formatos para el mismo instante, de modo que una comparación de
  // texto ajustada dejaría fuera cambios que sí interesan.
  const inicio = watched ? atStartOfDay(watched.startDate) : null;
  const fin = watched ? atEndOfDay(watched.endDate) : null;
  const limites = inicio && fin ? rangoDeConsulta(inicio, fin) : null;
  const desde = limites?.desde ?? null;
  const hasta = limites?.hasta ?? null;

  useEffect(() => {
    if (!desde || !hasta || !inicio || !fin) return undefined;

    let esLaPrimera = true;

    const unsubscribe = onSnapshot(
      query(
        collection(db, FIRESTORE_COLLECTIONS.CHECKLIST_REVISIONS),
        where('startDate', '>=', desde),
        where('startDate', '<=', hasta)
      ),
      (snapshot) => {
        // La primera emisión trae lo que el adaptador acaba de leer.
        if (esLaPrimera) {
          esLaPrimera = false;
          return;
        }

        const cambiadas = snapshot
          .docChanges()
          .filter((cambio) => cambio.type !== 'removed')
          // Lo que el propio navegador acaba de escribir llega antes de
          // confirmarse; se espera a la confirmación para no pintar dos veces.
          .filter((cambio) => !cambio.doc.metadata.hasPendingWrites)
          .map((cambio) => ({ id: cambio.doc.id, ...cambio.doc.data() } as ChecklistRevision))
          .filter((revision) => dentroDelRango(revision.startDate, inicio, fin));

        if (cambiadas.length === 0) return;

        setDataRef.current((actuales) => aplicarCambios(actuales, cambiadas));
      },
      (err) => console.warn('No se pudo escuchar cambios en las revisiones:', err)
    );

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desde, hasta]);
};

/**
 * Sustituye solo las filas alcanzadas por las revisiones que cambiaron.
 *
 * Una revisión de una programación que no está en pantalla —otra sede, otro
 * sector— se ignora: no hay fila que actualizar, y volver a consultar por ella
 * sería justo el parpadeo que se quiere evitar.
 */
const aplicarCambios = (
  actuales: ScheduleOccurrence[] | null,
  cambiadas: ChecklistRevision[]
): ScheduleOccurrence[] | null => {
  if (!actuales) return actuales;

  const porClave = new Map(
    cambiadas.map((revision) => [`${revision.scheduleId}::${dayKeyOf(revision.startDate)}`, revision])
  );

  let huboCambios = false;
  const siguiente = actuales.map((fila) => {
    const revision = porClave.get(fila.occurrenceId);
    if (!revision) return fila;

    const actualizada = recalcular(fila, revision);
    if (igualEnPantalla(fila, actualizada)) return fila;

    huboCambios = true;
    return actualizada;
  });

  return huboCambios ? siguiente : actuales;
};

const recalcular = (fila: ScheduleOccurrence, revision: ChecklistRevision): ScheduleOccurrence => ({
  ...fila,
  revisionId: revision.id,
  status: resolveStatus(revision, fila.date, fila.endTime, new Date()),
  ...countAnswers(revision),
  updatedAt: Date.now(),
});

/** Si nada de lo que se ve cambió, se deja la fila tal cual y React no repinta. */
const igualEnPantalla = (antes: ScheduleOccurrence, despues: ScheduleOccurrence): boolean =>
  antes.status === despues.status &&
  antes.revisionId === despues.revisionId &&
  antes.totalYes === despues.totalYes &&
  antes.totalNo === despues.totalNo;

export default useSchedulesByRange;
