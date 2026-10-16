// adapters/getChecklistsSearchAdapter.ts
// Reemplaza: getListWithCount.tsx (antiguo)
// Mejoras:
//   - Colecciones: "schedules" + "checklists" en vez de "Programming" + "Lists"
//   - activeDays.monday en vez del dayFieldMap con is_day_1..7
//   - Sede, Sector, Area, Categoría vienen desnormalizados en checklist y schedule
//     → elimina lookups a Sede, Sector, Area, Categoria_Checklist
//   - Días programados construidos desde activeDays en vez de is_day_N keys
//   - Elimina todos los console.log de depuración

import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../services/firebase";
import { ChecklistSchedule } from "../../../models/ChecklistSchedule";
import { Checklist } from "../../../models/Checklist";
import { FIRESTORE_COLLECTIONS } from "../../../constants/firestoreCollections";

export interface ChecklistsSearchParams {
  sedeId?: string | null;
  sectorId?: string | null;
  areaId?: number | null;
  categoryId?: string | null;
  dayOfWeek?: keyof ChecklistSchedule["activeDays"] | null; // "monday" | "tuesday" | ...
  isEnabled?: boolean | null;
}

export interface ChecklistsSearchColumns {
  checklistName?: boolean;
  checklistCode?: boolean;
  requiresPhoto?: boolean;
  requiresFirm?: boolean;
  scheduleObservations?: boolean;
  categoryCode?: boolean;
  categoryName?: boolean;
  categoryColor?: boolean;
  areaCode?: boolean;
  areaLevel?: boolean;
  areaName?: boolean;
  sectorCode?: boolean;
  sectorName?: boolean;
  sedeCode?: boolean;
  sedeName?: boolean;
  scheduledDays?: boolean;
  timeRange?: boolean;
  scheduleCode?: boolean;
  [key: string]: boolean | undefined;
}

export interface ChecklistSearchResult {
  checklistId: string;
  checklistName?: string;
  checklistCode?: string;
  requiresPhoto?: string;
  requiresFirm?: string;
  scheduleObservations?: string;
  categoryCode?: string;
  categoryName?: string;
  categoryColor?: string;
  areaCode?: number;
  areaLevel?: string;
  areaName?: string;
  sectorCode?: string;
  sectorName?: string;
  sedeCode?: string;
  sedeName?: string;
  scheduledDays?: string;
  timeRange?: string;
  scheduleCode?: string;
  [key: string]: unknown;
}

// Mapeo activeDays key → label en español
const DAY_LABELS: Record<keyof ChecklistSchedule["activeDays"], string> = {
  monday:    "Lunes",
  tuesday:   "Martes",
  wednesday: "Miércoles",
  thursday:  "Jueves",
  friday:    "Viernes",
  saturday:  "Sábado",
  sunday:    "Domingo",
};

export const getChecklistsSearchAdapter = async (
  params: ChecklistsSearchParams,
  columns: ChecklistsSearchColumns
): Promise<ChecklistSearchResult[]> => {
  const {
    sedeId = null, sectorId = null, areaId = null,
    categoryId = null, dayOfWeek = null, isEnabled = null,
  } = params;

  // 1. Query a schedules con los filtros disponibles en índice
  let schedulesQ = query(collection(db, FIRESTORE_COLLECTIONS.CHECKLIST_SCHEDULES));

  if (sedeId)          schedulesQ = query(schedulesQ, where("sedeId",   "==", sedeId));
  if (sectorId)        schedulesQ = query(schedulesQ, where("sectorId", "==", sectorId));
  if (areaId != null)  schedulesQ = query(schedulesQ, where("areaId",   "==", areaId));
  if (isEnabled != null) schedulesQ = query(schedulesQ, where("isEnabled", "==", isEnabled));
  if (dayOfWeek)       schedulesQ = query(schedulesQ, where(`activeDays.${dayOfWeek}`, "==", true));

  const schedulesSnap = await getDocs(schedulesQ);
  if (schedulesSnap.empty) return [];

  const schedules = schedulesSnap.docs.map(
    (d) => ({ id: d.id, ...d.data() } as ChecklistSchedule)
  );

  // 2. IDs únicas de checklists
  const checklistIds = Array.from(new Set(schedules.map((s) => s.checklistId)));
  if (checklistIds.length === 0) return [];

  // 3. Query a checklists — puede incluir filtro de categoría
  let checklistsQ = query(
    collection(db, FIRESTORE_COLLECTIONS.CHECKLIST_CHECKLISTS),
    where("__name__", "in", checklistIds)
  );
  if (categoryId) checklistsQ = query(checklistsQ, where("categoryId", "==", categoryId));

  const checklistsSnap = await getDocs(checklistsQ);
  const checklistMap: Record<string, Checklist> = {};
  checklistsSnap.docs.forEach((d) => {
    checklistMap[d.id] = { id: d.id, ...d.data() } as Checklist;
  });

  // 4. Construir resultado — nombres ya desnormalizados en checklist y schedule
  const results: ChecklistSearchResult[] = schedules
    .map((schedule) => {
      const checklist = checklistMap[schedule.checklistId];
      if (!checklist) return null; // filtrado por categoría puede excluirlo

      const row: ChecklistSearchResult = { checklistId: checklist.id };

      if (columns.checklistName)         row.checklistName         = checklist.name;
      if (columns.checklistCode)         row.checklistCode         = checklist.id;
      if (columns.requiresPhoto)         row.requiresPhoto         = checklist.needPhoto ? "Sí" : "No";
      if (columns.requiresFirm)          row.requiresFirm          = checklist.needFirm  ? "Sí" : "No";
      if (columns.scheduleObservations)  row.scheduleObservations  = schedule.observations;
      if (columns.categoryCode)          row.categoryCode          = checklist.categoryId;
      if (columns.categoryName)          row.categoryName          = checklist.categoryName;  // desnormalizado
      if (columns.areaCode)              row.areaCode              = schedule.areaId;
      if (columns.sectorCode)            row.sectorCode            = schedule.sectorId;
      if (columns.sedeCode)              row.sedeCode              = schedule.sedeId;
      if (columns.scheduleCode)          row.scheduleCode          = schedule.id;

      // Días programados — construidos desde activeDays en vez de is_day_N keys
      if (columns.scheduledDays) {
        row.scheduledDays = (Object.keys(DAY_LABELS) as (keyof ChecklistSchedule["activeDays"])[])
          .filter((k) => schedule.activeDays[k])
          .map((k) => DAY_LABELS[k])
          .join(", ");
      }

      if (columns.timeRange) {
        row.timeRange = `${schedule.startTime} – ${schedule.endTime}`;
      }

      return row;
    })
    .filter((r): r is ChecklistSearchResult => r !== null);

  return results;
};
