// src/pages/CheckListManagerListPrograming/hooks/useChecklistsSchedules.ts
import { useState, useEffect, useCallback } from "react";
import api from "../../../services/api";
import { ChecklistSchedule, ChecklistActiveDays } from "../../../models/ChecklistSchedule";
import { Checklist } from "../../../models/Checklist";
import { resolveScheduleLocationMaps } from "../../../services/scheduleLocationNames";

export interface EnrichedSchedule extends ChecklistSchedule {
  sedeName?: string;
  sectorName?: string;
  areaName?: string;
  daysSummary?: string;
}

const DAY_KEYS: (keyof ChecklistActiveDays)[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const DAY_SHORT_NAMES: Record<keyof ChecklistActiveDays, string> = {
  monday: "Lun",
  tuesday: "Mar",
  wednesday: "Mié",
  thursday: "Jue",
  friday: "Vie",
  saturday: "Sáb",
  sunday: "Dom",
};

export const getDaysSummary = (activeDays: ChecklistActiveDays): string => {
  if (!activeDays) return "Sin días";
  const activeKeys = DAY_KEYS.filter((k) => activeDays[k] === true);
  if (activeKeys.length === 7) return "Todos los días";
  if (
    activeKeys.length === 5 &&
    activeDays.monday &&
    activeDays.tuesday &&
    activeDays.wednesday &&
    activeDays.thursday &&
    activeDays.friday
  ) {
    return "Lun - Vie";
  }
  if (activeKeys.length === 2 && activeDays.saturday && activeDays.sunday) {
    return "Fin de semana";
  }
  if (activeKeys.length === 0) return "Sin días";
  return activeKeys.map((k) => DAY_SHORT_NAMES[k]).join(", ");
};

export const useChecklistsSchedules = (checklists: Checklist[]) => {
  const [schedulesMap, setSchedulesMap] = useState<Record<string, EnrichedSchedule[]>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [trigger, setTrigger] = useState<number>(0);

  const refresh = useCallback(() => {
    setTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!checklists || checklists.length === 0) {
      setSchedulesMap({});
      return;
    }

    const checklistIds = checklists.map((c) => String(c.id)).filter(Boolean);
    if (checklistIds.length === 0) {
      setSchedulesMap({});
      return;
    }

    let isCancelled = false;

    const loadSchedules = async () => {
      setLoading(true);
      try {
        const response = await api.get('/checklist-schedules');
        const allSchedules: any[] = response.data?.schedules || [];

        // Filtrar los schedules de los checklists actuales que estén habilitados
        const filtered = allSchedules.filter((s) => {
          const cId = String(s.checklistId || s.checklist_id || '');
          const isEnabled = s.isEnabled !== false && s.status !== 'inactive';
          return checklistIds.includes(cId) && isEnabled;
        });

        // Resolver mapa de nombres de ubicaciones
        const maps = await resolveScheduleLocationMaps(filtered);

        const map: Record<string, EnrichedSchedule[]> = {};

        filtered.forEach((sch) => {
          const cId = String(sch.checklistId || sch.checklist_id || '');
          const sId = String(sch.sedeId || sch.sede_id || '');
          const secId = String(sch.sectorId || sch.sector_id || '');
          const aId = sch.areaId !== undefined ? sch.areaId : sch.area_id;

          const sedeName = sch.sedeName || maps.sedeMap[sId] || sId || "";
          const sectorName = sch.sectorName || maps.sectorMap[secId] || secId || "";
          const areaIdNum = typeof aId === "number" ? aId : Number(aId) || 0;
          const areaName =
            sch.areaName ||
            (areaIdNum ? maps.areaMap[areaIdNum] : "") ||
            (areaIdNum ? `Área ${areaIdNum}` : "");
          const daysSummary = getDaysSummary(sch.activeDays);

          const enriched: EnrichedSchedule = {
            ...sch,
            id: sch.id || sch._id,
            checklistId: cId,
            sedeId: sId,
            sectorId: secId,
            areaId: aId,
            sedeName,
            sectorName,
            areaName,
            daysSummary,
          };

          if (!map[cId]) {
            map[cId] = [];
          }
          map[cId].push(enriched);
        });

        if (!isCancelled) {
          setSchedulesMap(map);
        }
      } catch (err) {
        console.error("Error al cargar schedules de los checklists:", err);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadSchedules();

    return () => {
      isCancelled = true;
    };
  }, [checklists, trigger]);

  return { schedulesMap, loading, refresh };
};
