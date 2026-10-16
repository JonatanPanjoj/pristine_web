// adapters/getSchedulesByRangeAdapter.ts
// Programaciones + su ejecución para un RANGO de fechas (día, semana o mes).
//
// AHORRO DE CONSULTAS — el coste es constante, no crece con el número de días:
//   1 consulta de schedules (sin filtro de día)  +  ceil(n/30) de revisiones del
//   rango completo  +  los mapas de nombres por lotes. Resolverlo llamando al
//   adaptador por día costaría ~2 consultas × 30 días para un mes; así son ~2 en
//   total. La expansión día a día se hace en memoria con `activeDays`, que ya
//   viene en cada schedule.
//
// Cuando el rango es un solo día se reaprovecha el índice `activeDays.<día>`
// para no leer schedules que no aplican.

import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../services/firebase";
import { resolveScheduleLocationMaps } from "../../../services/scheduleLocationNames";
import { ChecklistSchedule } from "../../../models/ChecklistSchedule";
import { ChecklistRevision } from "../../../models/ChecklistRevision";
import { FIRESTORE_COLLECTIONS } from "../../../constants/firestoreCollections";
import { ScheduleExecutionStatus } from "./getSchedulesByDateAdapter";
import { atStartOfDay, atEndOfDay, toDateInputValue } from "../utils/dateRange";
import { indexLastRevisions } from "../../../services/lastRevisionPerDay";
import { rangoDeConsulta, dentroDelRango } from "../../../services/revisionDateRange";

const DAY_KEYS: (keyof ChecklistSchedule["activeDays"])[] = [
  "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday",
];

const IN_LIMIT = 30;

export interface ScheduleOccurrence {
  /** Clave única de la ocurrencia: una programación puede repetirse cada día. */
  occurrenceId: string;
  /** Día al que corresponde, en formato YYYY-MM-DD. */
  date: string;
  scheduleId: string;
  checklistId: string;
  checklistName: string;
  categoryId: string;
  categoryName: string;
  sedeId: string;
  sedeName: string;
  sectorId: string;
  sectorName: string;
  areaId: number;
  areaName: string;
  startTime: string;
  endTime: string;
  revisionId: string | null;
  status: ScheduleExecutionStatus;
  totalYes: number;
  totalNo: number;
  /**
   * Cuándo se actualizó esta fila en vivo. Sirve para resaltarla un momento: sin
   * eso, un cambio en una tabla de cincuenta filas pasa desapercibido.
   */
  updatedAt?: number;
}

export interface GetSchedulesByRangeParams {
  startDate: Date;
  endDate: Date;
  /** Vacío significa todas las sedes que el usuario puede ver. */
  sedeId: string;
  sectorId?: string | null;
  areaId?: number | null;
  categoryId?: string | null;
}

export const getSchedulesByRangeAdapter = async (
  params: GetSchedulesByRangeParams
): Promise<ScheduleOccurrence[]> => {
  const { startDate, endDate, sedeId, sectorId = null, areaId = null, categoryId = null } = params;

  const days = eachDayInRange(startDate, endDate);
  if (days.length === 0) return [];

  const schedules = await fetchSchedules({ sedeId, sectorId, areaId, days });
  if (schedules.length === 0) return [];

  const [revisionIndex, maps] = await Promise.all([
    fetchRevisionIndex(schedules.map((s) => s.id), startDate, endDate),
    resolveScheduleLocationMaps(schedules),
  ]);

  const now = new Date();
  const occurrences: ScheduleOccurrence[] = [];

  days.forEach((day) => {
    const dayKey = DAY_KEYS[day.getDay()];
    const dateKey = toDateInputValue(day);

    schedules.forEach((schedule) => {
      if (!schedule.activeDays?.[dayKey]) return;

      const checklist = maps.checklistData[schedule.checklistId];
      // Una programación de una lista borrada no es ejecutable, y el sistema
      // anterior tampoco la enseña. Sin esta línea Metronorte salía con 205
      // programaciones el jueves donde de verdad hay 49: en esta base hay 1 004
      // listas borradas de 1 084, y sus programaciones seguían contando como
      // vencidas.
      if (!checklist || checklist.isEnabled === false) return;
      // Y lo mismo con el área: las tres "Parqueo Renap" del jueves 24 salían
      // como vencidas para siempre porque el área ya no existe.
      if (maps.disabledAreas.has(String(schedule.areaId))) return;

      const catId = checklist.categoryId ?? "";
      if (categoryId && catId !== categoryId) return;

      const revision = revisionIndex[`${schedule.id}::${dateKey}`] ?? null;

      occurrences.push({
        occurrenceId: `${schedule.id}::${dateKey}`,
        date: dateKey,
        scheduleId: schedule.id,
        checklistId: schedule.checklistId,
        checklistName: schedule.checklistName || checklist?.name || "",
        categoryId: catId,
        categoryName: maps.categoryMap[catId] ?? "",
        sedeId: schedule.sedeId,
        sedeName: maps.sedeMap[schedule.sedeId] ?? "",
        sectorId: schedule.sectorId,
        sectorName: maps.sectorMap[schedule.sectorId] ?? "",
        areaId: schedule.areaId,
        areaName: maps.areaMap[schedule.areaId] ?? "",
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        revisionId: revision?.id ?? null,
        status: resolveStatus(revision, dateKey, schedule.endTime, now),
        ...countAnswers(revision),
      });
    });
  });

  return occurrences;
};

/* ── Consultas ────────────────────────────────────────────────────────────── */

const fetchSchedules = async (args: {
  sedeId: string;
  sectorId: string | null;
  areaId: number | null;
  days: Date[];
}): Promise<ChecklistSchedule[]> => {
  // Sin sede se consultan todas. Cuesta más —son todas las programaciones
  // habilitadas, no las de una sede— pero es la única forma de comparar sedes
  // entre sí, que es justo para lo que sirve el tablero.
  let schedulesQuery = query(
    collection(db, FIRESTORE_COLLECTIONS.CHECKLIST_SCHEDULES),
    where("isEnabled", "==", true)
  );
  if (args.sedeId) schedulesQuery = query(schedulesQuery, where("sedeId", "==", args.sedeId));
  if (args.sectorId) schedulesQuery = query(schedulesQuery, where("sectorId", "==", args.sectorId));
  if (args.areaId !== null) schedulesQuery = query(schedulesQuery, where("areaId", "==", args.areaId));

  // Un solo día: el índice puede descartar las programaciones que no aplican.
  if (args.days.length === 1) {
    schedulesQuery = query(schedulesQuery, where(`activeDays.${DAY_KEYS[args.days[0].getDay()]}`, "==", true));
  }

  const snapshot = await getDocs(schedulesQuery);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ChecklistSchedule));
};

/** Revisiones del rango indexadas por "scheduleId::YYYY-MM-DD". */
const fetchRevisionIndex = async (
  scheduleIds: string[],
  startDate: Date,
  endDate: Date
): Promise<Record<string, ChecklistRevision>> => {
  const chunks: string[][] = [];
  for (let i = 0; i < scheduleIds.length; i += IN_LIMIT) {
    chunks.push(scheduleIds.slice(i, i + IN_LIMIT));
  }

  // Los límites que se mandan a Firestore van holgados: `startDate` es texto y
  // conviven dos formatos para el mismo instante ("...-06:00" y "...Z"), de modo
  // que una comparación de texto ajustada deja fuera revisiones que sí entran.
  // El recorte exacto se hace después, comparando fechas de verdad.
  const inicio = atStartOfDay(startDate);
  const fin = atEndOfDay(endDate);
  const { desde, hasta } = rangoDeConsulta(inicio, fin);

  const snapshots = await Promise.all(
    chunks.map((chunk) =>
      getDocs(
        query(
          collection(db, FIRESTORE_COLLECTIONS.CHECKLIST_REVISIONS),
          where("scheduleId", "in", chunk),
          where("startDate", ">=", desde),
          where("startDate", "<=", hasta)
        )
      )
    )
  );

  const ultimas = indexLastRevisions(
    snapshots
      .flatMap((snapshot) => snapshot.docs)
      .map((doc) => ({ id: doc.id, ...doc.data() } as ChecklistRevision))
      .filter((revision) => dentroDelRango(revision.startDate, inicio, fin))
  );

  return Object.fromEntries(ultimas);
};

/* ── Derivados ────────────────────────────────────────────────────────────── */

const eachDayInRange = (startDate: Date, endDate: Date): Date[] => {
  const days: Date[] = [];
  const cursor = atStartOfDay(startDate);
  const last = atStartOfDay(endDate);
  while (cursor <= last) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
};

export const resolveStatus = (
  revision: ChecklistRevision | null,
  dateKey: string,
  endTime: string,
  now: Date
): ScheduleExecutionStatus => {
  if (revision?.status === "completed") return "completed";
  if (revision?.status === "in_progress") return "in_progress";
  return now <= new Date(`${dateKey}T${endTime}`) ? "pending" : "overdue";
};

export const countAnswers = (revision: ChecklistRevision | null): { totalYes: number; totalNo: number } => {
  if (revision?.status !== "completed") return { totalYes: 0, totalNo: 0 };

  let totalYes = 0;
  let totalNo = 0;
  revision.answers?.forEach((answer) => {
    if (answer.value === "yes") totalYes++;
    if (answer.value === "no") totalNo++;
  });
  return { totalYes, totalNo };
};
