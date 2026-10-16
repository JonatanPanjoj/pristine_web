// services/scheduleLocationNames.ts
// Resolvedor de nombres (Sede / Sector / Área / Checklist / Categoría) para
// schedules, utilizando el cliente REST API de MongoDB.

import api from "./api";

export interface ChecklistMeta {
  name: string;
  categoryId: string;
  needFirm: boolean;
  needPhoto: boolean;
  isEnabled: boolean;
}

export interface ScheduleLocationMaps {
  sedeMap: Record<string, string>;
  sectorMap: Record<string, string>;
  areaMap: Record<number, string>;
  checklistData: Record<string, ChecklistMeta>;
  disabledAreas: Set<string>;
  categoryMap: Record<string, string>;
}

interface SchedulePlaces {
  sedeId: string;
  sectorId: string;
  areaId: number;
  checklistId: string;
}

/**
 * Resuelve los nombres de Sede/Sector/Área + metadata de Checklist/Categoría para
 * un conjunto de schedules utilizando la API REST de MongoDB.
 */
export async function resolveScheduleLocationMaps(
  schedules: SchedulePlaces[],
): Promise<ScheduleLocationMaps> {
  const sedeMap: Record<string, string> = {};
  const sectorMap: Record<string, string> = {};
  const areaMap: Record<number, string> = {};
  const checklistData: Record<string, ChecklistMeta> = {};
  const disabledAreas = new Set<string>();
  const categoryMap: Record<string, string> = {};

  try {
    const [sedesRes, sectorsRes, areasRes, checklistsRes, categoriesRes] = await Promise.all([
      api.get('/sedes'),
      api.get('/sectors'),
      api.get('/areas'),
      api.get('/checklists'),
      api.get('/checklist-categories'),
    ]);

    (sedesRes.data?.sedes || []).forEach((s: any) => {
      const id = s.id || s._id;
      const name = s.name || '';
      if (id) sedeMap[id] = name;
      if (s.sede_id) sedeMap[s.sede_id] = name;
    });

    (sectorsRes.data?.sectors || []).forEach((s: any) => {
      const id = s.id || s._id;
      const name = s.name || '';
      if (id) sectorMap[id] = name;
      if (s.sector_id) sectorMap[s.sector_id] = name;
    });

    (areasRes.data?.areas || []).forEach((a: any) => {
      const aId = Number(a.area_id ?? a.areaId);
      const name = a.name || '';
      if (!isNaN(aId)) {
        areaMap[aId] = name;
        if (a.status === false || a.is_enabled === false) {
          disabledAreas.add(String(aId));
        }
      }
    });

    (checklistsRes.data?.checklists || []).forEach((c: any) => {
      const id = c.id || c._id;
      if (id) {
        checklistData[id] = {
          name: c.name || '',
          categoryId: c.category_id || c.categoryId || '',
          needFirm: c.needFirm ?? false,
          needPhoto: c.needPhoto ?? false,
          isEnabled: c.status !== false && c.isEnabled !== false,
        };
      }
    });

    (categoriesRes.data?.categories || []).forEach((cat: any) => {
      const id = cat.id || cat._id;
      if (id) categoryMap[id] = cat.name || '';
    });
  } catch (error) {
    console.error("Error resolviendo nombres de ubicaciones y checklists:", error);
  }

  return { sedeMap, sectorMap, areaMap, checklistData, categoryMap, disabledAreas };
}
