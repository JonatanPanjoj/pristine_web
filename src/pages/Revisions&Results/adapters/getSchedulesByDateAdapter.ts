// adapters/getSchedulesByDateAdapter.ts
// Firestore collections: "schedules", "revisions"
// Reemplaza: handleEnabledProgramingsAndListsBySpecificDate
//
// FIX (nombres de programaciones): los nombres de Sede/Sector/Área/Categoría se
// resolvían SOLO desde el snapshot de la revisión (revision.location / .checklist).
// Una programación sin revisión aún (pendiente/vencida) tenía revision=null y los
// nombres salían vacíos. Ahora se resuelven por LOTES (resolveScheduleLocationMaps),
// igual que getActiveSchedulesAdapter: pocas consultas totales, no N×3.
// La revisión sigue aportando status de ejecución, revisionId y totales (answers).

import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../services/firebase";
import { resolveScheduleLocationMaps } from "../../../services/scheduleLocationNames";
import { ChecklistSchedule } from "../../../models/ChecklistSchedule";
import { ChecklistRevision } from "../../../models/ChecklistRevision";
import { FIRESTORE_COLLECTIONS } from "../../../constants/firestoreCollections";
import { indexLastRevisions } from "../../../services/lastRevisionPerDay";
import { rangoDeConsulta, dentroDelRango } from "../../../services/revisionDateRange";

const DAY_KEYS: (keyof ChecklistSchedule["activeDays"])[] = [
  "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday",
];

const IN_LIMIT = 30;

/** Día en hora local, `YYYY-MM-DD`. `toISOString()` daría el día en UTC. */
const localDateKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;

export type ScheduleExecutionStatus = "completed" | "in_progress" | "pending" | "overdue";

export interface ScheduleByDateResult {
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
  activeDays: ChecklistSchedule["activeDays"];
  observations: string;
  revisionId: string | null;
  status: ScheduleExecutionStatus;
  totalYes: number;
  totalNo: number;
}

export interface GetSchedulesByDateParams {
  specificDate: Date;
  sedeId: string;
  sectorId?: string | null;
  areaId?: number | null;
  categoryId?: string | null;
}

export const getSchedulesByDateAdapter = async (
  params: GetSchedulesByDateParams
): Promise<ScheduleByDateResult[]> => {
  try {
    const { specificDate, sedeId, sectorId = null, areaId = null, categoryId = null } = params;

    const dayKey = DAY_KEYS[specificDate.getDay()];
    const dateStart = new Date(specificDate);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(specificDate);
    dateEnd.setHours(23, 59, 59, 999);

    // 1. Schedules del día (filtros empujados al índice)
    // Sin sede se consultan todas: el filtro es opcional.
    let schedulesQuery = query(
      collection(db, FIRESTORE_COLLECTIONS.CHECKLIST_SCHEDULES),
      where("isEnabled", "==", true),
      where(`activeDays.${dayKey}`, "==", true)
    );
    if (sedeId) schedulesQuery = query(schedulesQuery, where("sedeId", "==", sedeId));
    if (sectorId) schedulesQuery = query(schedulesQuery, where("sectorId", "==", sectorId));
    if (areaId !== null) schedulesQuery = query(schedulesQuery, where("areaId", "==", areaId));

    const schedulesSnap = await getDocs(schedulesQuery);
    if (schedulesSnap.empty) return [];

    const schedules = schedulesSnap.docs.map(
      (d) => ({ id: d.id, ...d.data() } as ChecklistSchedule)
    );
    const scheduleIds = schedules.map((s) => s.id);

    // 2. Revisiones del día para esos schedules (chunked por el tope de 'in')
    const revisionChunks: string[][] = [];
    for (let i = 0; i < scheduleIds.length; i += IN_LIMIT) {
      revisionChunks.push(scheduleIds.slice(i, i + IN_LIMIT));
    }
    // Límites holgados a propósito: `startDate` es texto y hay dos formatos
    // conviviendo, así que la comparación de texto no es de fiar. Se afina abajo.
    const { desde, hasta } = rangoDeConsulta(dateStart, dateEnd);

    const revisionSnaps = await Promise.all(
      revisionChunks.map((chunk) =>
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

    // Una revisión por programación: el sistema anterior las duplica y 16 de las
    // 46 del jueves 24 venían repetidas, con un intento en blanco por delante del
    // bueno.
    const revisionBySchedule: Record<string, ChecklistRevision> = {};
    indexLastRevisions(
      revisionSnaps
        .flatMap((s) => s.docs)
        .map((d) => ({ id: d.id, ...d.data() } as ChecklistRevision))
        .filter((revision) => dentroDelRango(revision.startDate, dateStart, dateEnd))
    ).forEach((revision) => {
      revisionBySchedule[revision.scheduleId] = revision;
    });

    // 3. Nombres por lotes (funciona con o sin revisión asociada)
    const { sedeMap, sectorMap, areaMap, checklistData, categoryMap, disabledAreas } =
      await resolveScheduleLocationMaps(schedules);

    const now = new Date();

    return schedules
      .map((schedule) => {
        const revision  = revisionBySchedule[schedule.id] ?? null;
        const checklist = checklistData[schedule.checklistId];
        const catId     = checklist?.categoryId ?? "";

        // Totales desde answers embebidos (sin query a subcolección)
        let totalYes = 0;
        let totalNo = 0;
        if (revision?.status === "completed") {
          revision.answers.forEach((a) => {
            if (a.value === "yes") totalYes++;
            if (a.value === "no") totalNo++;
          });
        }

        const executionStatus: ScheduleExecutionStatus = (() => {
          if (revision?.status === "completed") return "completed";
          if (revision?.status === "in_progress") return "in_progress";
          // El cierre se compara en hora local. Con `toISOString()` se tomaba el
          // día en UTC, y en una zona por detrás eso adelanta la fecha por la
          // tarde: una programación de hoy se daba por vencida antes de tiempo.
          const endTime = new Date(`${localDateKey(specificDate)}T${schedule.endTime}`);
          return now <= endTime ? "pending" : "overdue";
        })();

        return {
          scheduleId: schedule.id,
          checklistId: schedule.checklistId,
          checklistName: schedule.checklistName || checklist?.name || "",
          categoryId: catId,
          categoryName: categoryMap[catId] ?? "",
          sedeId: schedule.sedeId,
          sedeName: sedeMap[schedule.sedeId] ?? "",
          sectorId: schedule.sectorId,
          sectorName: sectorMap[schedule.sectorId] ?? "",
          areaId: schedule.areaId,
          areaName: areaMap[schedule.areaId] ?? "",
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          activeDays: schedule.activeDays,
          observations: schedule.observations,
          revisionId: revision?.id ?? null,
          status: executionStatus,
          totalYes,
          totalNo,
        };
      })
      // Filtros finales que no se pueden empujar a la consulta porque se derivan
      // del checklist: la categoría, y que la lista siga habilitada.
      .filter((r) => checklistData[r.checklistId]?.isEnabled !== false)
      .filter((r) => !disabledAreas.has(String(r.areaId)))
      .filter((r) => !categoryId || r.categoryId === categoryId);
  } catch (error) {
    console.error("Error fetching schedules by date:", error);
    throw new Error("Could not fetch schedules by date.");
  }
};
