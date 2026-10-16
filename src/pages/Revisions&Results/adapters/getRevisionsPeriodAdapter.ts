// adapters/getRevisionsPeriodAdapter.ts
// FIX principal: la consulta a Firestore usaba endDate.toISOString() crudo. Si endDate
// venía a medianoche, el rango excluía casi todo el último día aunque buildRanges sí lo
// esperaba. Ahora la query usa inicio-de-día (00:00) y fin-de-día (23:59:59.999),
// coherente con los rangos que arma buildRanges.
// Menor: filtro de areaId usa "!= null" (areaId podría ser 0 y un && lo descartaría).

import { collection, query, where, getDocs, QueryConstraint } from "firebase/firestore";
import { db } from "../../../services/firebase";
import { ChecklistRevision } from "../../../models/ChecklistRevision";
import { FIRESTORE_COLLECTIONS } from "../../../constants/firestoreCollections";
import { lastRevisionPerDay } from "../../../services/lastRevisionPerDay";
import { rangoDeConsulta, dentroDelRango } from "../../../services/revisionDateRange";
import { atStartOfDay, atEndOfDay } from "../utils/dateRange";

export type RevisionsPeriod = "daily" | "weekly" | "monthly";

export interface RevisionsPeriodParams {
  startDate: Date;
  endDate: Date;
  period: RevisionsPeriod;
  sedeId?: string | null;
  sectorId?: string | null;
  areaId?: number | null;
  categoryId?: string | null;
  userId?: string | null;
}

export interface RevisionPeriodResult {
  periodLabel: string;
  totalYes: number;
  totalNo: number;
  totalNa: number;
}

interface DateRange { start: Date; end: Date; label: string; }


function buildRanges(startDate: Date, endDate: Date, period: RevisionsPeriod): DateRange[] {
  const ranges: DateRange[] = [];
  const adjStart = atStartOfDay(startDate);
  const adjEnd   = atEndOfDay(endDate);
  let current = new Date(adjStart);

  while (current <= adjEnd) {
    if (period === "daily") {
      const start = atStartOfDay(current);
      const end   = atEndOfDay(current);
      ranges.push({
        start, end,
        label: `${start.toLocaleString("en-US", { weekday: "long" })} (${start.toLocaleDateString()})`,
      });
      current.setDate(current.getDate() + 1);

    } else if (period === "weekly") {
      const startOfWeek = new Date(current);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      if (startOfWeek > adjEnd) break;
      const weekNum = Math.ceil(
        (startOfWeek.getTime() - new Date(startOfWeek.getFullYear(), 0, 1).getTime()) /
        (7 * 24 * 60 * 60 * 1000)
      );
      ranges.push({
        start: new Date(Math.max(startOfWeek.getTime(), adjStart.getTime())),
        end:   new Date(Math.min(endOfWeek.getTime(),   adjEnd.getTime())),
        label: `Week ${weekNum} (${startOfWeek.toLocaleDateString("en-US", { month: "long", year: "numeric" })})`,
      });
      current = new Date(endOfWeek);
      current.setDate(current.getDate() + 1);

    } else {
      const startOfMonth = new Date(current.getFullYear(), current.getMonth(), 1);
      startOfMonth.setHours(0, 0, 0, 0);
      const endOfMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);
      if (startOfMonth > adjEnd) break;
      ranges.push({
        start: new Date(Math.max(startOfMonth.getTime(), adjStart.getTime())),
        end:   new Date(Math.min(endOfMonth.getTime(),   adjEnd.getTime())),
        label: startOfMonth.toLocaleString("en-US", { month: "long", year: "numeric" }),
      });
      current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    }
  }
  return ranges;
}

export const getRevisionsPeriodAdapter = async (
  params: RevisionsPeriodParams
): Promise<RevisionPeriodResult[]> => {
  const {
    startDate, endDate, period,
    sedeId = null, sectorId = null, areaId = null,
    categoryId = null, userId = null,
  } = params;

  const ranges = buildRanges(startDate, endDate, period);

  const grouped: Record<string, RevisionPeriodResult> = {};
  ranges.forEach((r) => {
    grouped[r.label] = { periodLabel: r.label, totalYes: 0, totalNo: 0, totalNa: 0 };
  });

  // Query a "revisions" — un solo fetch, con límites de día correctos
  // Holgado a propósito: `startDate` es texto y hay dos formatos conviviendo.
  const inicio = atStartOfDay(startDate);
  const fin = atEndOfDay(endDate);
  const { desde, hasta } = rangoDeConsulta(inicio, fin);

  const constraints: QueryConstraint[] = [
    where("startDate", ">=", desde),
    where("startDate", "<=", hasta),
  ];
  if (userId) constraints.push(where("user.id", "==", userId));

  const snap = await getDocs(query(collection(db, FIRESTORE_COLLECTIONS.CHECKLIST_REVISIONS), ...constraints));
  if (snap.empty) return Object.values(grouped);

  // Una revisión por programación y día: el sistema anterior las duplica, y
  // contando las dos cada "no" del intento en blanco cuenta como incumplimiento.
  const revisions = lastRevisionPerDay(
    snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as ChecklistRevision))
      .filter((revision) => dentroDelRango(revision.startDate, inicio, fin))
  );

  revisions.forEach((rev) => {
    // Filtros de ubicación — campos embebidos, sin lookup
    if (sedeId     && rev.location?.sedeId      !== sedeId)     return;
    if (sectorId   && rev.location?.sectorId    !== sectorId)   return;
    if (areaId != null && rev.location?.areaId  !== areaId)     return;
    if (categoryId && rev.checklist?.categoryId !== categoryId) return;

    const revDate = new Date(rev.startDate);
    const range   = ranges.find((r) => revDate >= r.start && revDate <= r.end);
    if (!range) return;

    rev.answers?.forEach((a) => {
      if (a.value === "yes") grouped[range.label].totalYes++;
      else if (a.value === "no") grouped[range.label].totalNo++;
      else grouped[range.label].totalNa++;
    });
  });

  return Object.values(grouped);
};
