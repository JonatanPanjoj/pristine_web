// hooks/useSedeSectorAreaCategory.ts
// En el nuevo esquema los nombres de sede/sector/área/categoría vienen
// embebidos en revision.location y revision.checklist — este hook ya no
// se necesita en RevisionForm ni RevisionView.
// Se mantiene SOLO para los selects de filtro en Views (ScheduleView, RevisionsView)
// que aún necesitan cargar nombres desde las colecciones Sede, Sector, Area, categories.
// getSedeSectorAreaCategoryAdapter sigue existiendo para ese caso.

import { useCallback, useState } from "react";
import {
  getSedeById,
  getSectorById,
  getAreaById,
  getCategoriaChecklistById,
} from "../adapters/getSedeSectorAreaCategoryAdapter";

export const useSedeSectorAreaCategory = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSede = async (sedeId: string) => {
    setLoading(true);
    setError(null);
    try {
      return await getSedeById(sedeId);
    } catch (err: any) {
      setError(err.message || "Could not fetch sede.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchSector = async (sectorId: string) => {
    setLoading(true);
    setError(null);
    try {
      return await getSectorById(sectorId);
    } catch (err: any) {
      setError(err.message || "Could not fetch sector.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchArea = async (areaId: number) => {
    setLoading(true);
    setError(null);
    try {
      return await getAreaById(areaId);
    } catch (err: any) {
      setError(err.message || "Could not fetch area.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoriaChecklist = useCallback(async (categoryId: string) => {
    setLoading(true);
    setError(null);
    try {
      return await getCategoriaChecklistById(categoryId);
    } catch (err: any) {
      setError(err.message || "Could not fetch category.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { fetchSede, fetchSector, fetchArea, fetchCategoriaChecklist, loading, error };
};
