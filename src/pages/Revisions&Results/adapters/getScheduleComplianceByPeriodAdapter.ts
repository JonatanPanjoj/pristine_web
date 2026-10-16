// adapters/getScheduleComplianceByPeriodAdapter.ts
// Firestore collections: "schedules", "revisions"
// Reemplaza: handleEnabledProgramingsAndListsByPeriod
// Mejora:
//   - activeDays.monday en vez de is_day_${n} con template literal
//   - status "completed" en vez de status === 2
//   - Elimina import { Console } from "console" (era un bug)
//   - camelCase consistente en parámetros

import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "../../../services/firebase";
import { ChecklistSchedule } from "../../../models/ChecklistSchedule";
import { FIRESTORE_COLLECTIONS } from "../../../constants/firestoreCollections";

const IN_LIMIT = 30;

const DAY_KEYS: (keyof ChecklistSchedule["activeDays"])[] = [
  "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday",
];

export type CompliancePeriod = "daily" | "weekly" | "monthly";

export interface CompliancePeriodResult {
  periodLabel: string;
  compliancePercentage: number;
}

export interface GetScheduleComplianceParams {
  startDate: Date;
  endDate: Date;
  period: CompliancePeriod;
  sedeId: string;
  sectorId?: string | null;
  areaId?: number | null;
  categoryId?: string | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getWeekNumber(date: Date): number {
  const firstDay = new Date(date.getFullYear(), 0, 1);
  const pastDays = (date.getTime() - firstDay.getTime()) / 86_400_000;
  return Math.ceil((pastDays + firstDay.getDay() + 1) / 7);
}

function getDaysInRange(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  const current = new Date(start);
  while (current <= end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
}

function buildDateRanges(
  startDate: Date,
  endDate: Date,
  period: CompliancePeriod
): { start: Date; end: Date; label: string }[] {
  const ranges: { start: Date; end: Date; label: string }[] = [];
  let current = new Date(startDate);

  while (current <= endDate) {
    const start = new Date(current);
    start.setHours(0, 0, 0, 0);
    let end: Date;

    if (period === "daily") {
      end = new Date(current);
      end.setHours(23, 59, 59, 999);
      ranges.push({
        start, end,
        label: `${start.toLocaleDateString()} (${start.toLocaleDateString("es-ES", { weekday: "long" })})`,
      });
      current.setDate(current.getDate() + 1);

    } else if (period === "weekly") {
      end = new Date(start);
      end.setDate(end.getDate() + 6);
      if (end > endDate) end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      ranges.push({
        start, end,
        label: `Week ${getWeekNumber(start)} of ${start.getFullYear()}`,
      });
      current.setDate(current.getDate() + 7);

    } else {
      end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
      if (end > endDate) end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      ranges.push({
        start, end,
        label: `${start.toLocaleDateString("es-ES", { month: "long" })} ${start.getFullYear()}`,
      });
      current = new Date(start.getFullYear(), start.getMonth() + 1, 1);
    }
  }
  return ranges;
}

// ── Adapter principal ─────────────────────────────────────────────────────────

export const getScheduleComplianceByPeriodAdapter = async (
  params: GetScheduleComplianceParams
): Promise<CompliancePeriodResult[]> => {
  try {
    const {
      startDate, endDate, period,
      sedeId, sectorId = null, areaId = null, categoryId = null,
    } = params;

    if (!sedeId) return [];

    // 1. Traer todos los schedules habilitados para esta sede
    //    (7 queries por día de semana → deduplicados, igual que el original)
    const dayQueries = DAY_KEYS.map((dayKey) =>
      getDocs(
        query(
          collection(db, FIRESTORE_COLLECTIONS.CHECKLIST_SCHEDULES),
          where("isEnabled", "==", true),
          where("sedeId", "==", sedeId),
          where(`activeDays.${dayKey}`, "==", true)
        )
      )
    );

    const snapshots = await Promise.all(dayQueries);

    // Deduplicar por id
    const scheduleMap = new Map<string, ChecklistSchedule>();
    snapshots.forEach((snap) =>
      snap.docs.forEach((d) => {
        const s = { id: d.id, ...d.data() } as ChecklistSchedule;
        // Filtros opcionales de sector y área
        if (sectorId && s.sectorId !== sectorId) return;
        if (areaId && s.areaId !== areaId) return;
        scheduleMap.set(s.id, s);
      })
    );

    const schedules = Array.from(scheduleMap.values());
    if (schedules.length === 0) return [];

    const dateRanges = buildDateRanges(startDate, endDate, period);

    // 2. Para cada rango calcular el promedio diario de cumplimiento
    const results: CompliancePeriodResult[] = await Promise.all(
      dateRanges.map(async (range) => {
        const days = getDaysInRange(range.start, range.end);

        const dailyPercentages = await Promise.all(
          days.map(async (day) => {
            const dayKey = DAY_KEYS[day.getDay()];

            // Schedules relevantes para este día de la semana
            const relevantSchedules = schedules.filter((s) => s.activeDays[dayKey]);
            if (relevantSchedules.length === 0) return 0;

            const scheduleIds = relevantSchedules.map((s) => s.id);
            const dayStart = new Date(day); dayStart.setHours(0, 0, 0, 0);
            const dayEnd   = new Date(day); dayEnd.setHours(23, 59, 59, 999);

            // El `in` de Firestore admite 30 valores: con 205 programaciones la
            // consulta fallaba entera y el día salía en cero.
            const chunks: string[][] = [];
            for (let i = 0; i < scheduleIds.length; i += IN_LIMIT) {
              chunks.push(scheduleIds.slice(i, i + IN_LIMIT));
            }

            const snaps = await Promise.all(
              chunks.map((chunk) =>
                getDocs(
                  query(
                    collection(db, FIRESTORE_COLLECTIONS.CHECKLIST_REVISIONS),
                    where("scheduleId", "in", chunk),
                    where("startDate", ">=", dayStart.toISOString()),
                    where("startDate", "<", dayEnd.toISOString())
                  )
                )
              )
            );

            // Se cuentan **programaciones** cumplidas, no revisiones: con las
            // duplicadas del sistema anterior el porcentaje pasaba de 100.
            const cumplidas = new Set<string>();
            snaps
              .flatMap((snap) => snap.docs)
              .forEach((d) => {
                const data = d.data();
                if (data.status === "completed") cumplidas.add(data.scheduleId);
              });

            return (cumplidas.size / relevantSchedules.length) * 100;
          })
        );

        const average =
          dailyPercentages.length > 0
            ? dailyPercentages.reduce((sum, v) => sum + v, 0) / dailyPercentages.length
            : 0;

        return {
          periodLabel: range.label,
          compliancePercentage: parseFloat(average.toFixed(2)),
        };
      })
    );

    return results;
  } catch (error) {
    console.error("Error fetching compliance by period:", error);
    throw new Error("Could not fetch compliance by period.");
  }
};
