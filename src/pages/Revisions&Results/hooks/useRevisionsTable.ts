// hooks/useRevisionsTable.ts
import { useState, useEffect, useCallback } from "react";
import api from "../../../services/api";
import { ChecklistRevision } from "../../../models/ChecklistRevision";

interface UseRevisionsTableReturn {
  data: ChecklistRevision[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

const startOfDayISO = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.toISOString();
};

const endOfDayISO = (d: Date) => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x.toISOString();
};

export const useRevisionsTable = (
  startDate: Date,
  endDate: Date
): UseRevisionsTableReturn => {
  const [data, setData] = useState<ChecklistRevision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  const refresh = useCallback(() => {
    setTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (startDate.getTime() > endDate.getTime()) {
        setData([]);
        setError("La fecha de inicio es posterior a la fecha de fin.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await api.get('/checklist-revisions', {
          params: {
            startDate: startOfDayISO(startDate),
            endDate: endOfDayISO(endDate),
            limit: 500,
          },
        });

        if (cancelled) return;

        const raw: any[] = response.data?.revisions || [];
        const normalized: ChecklistRevision[] = raw.map((r: any) => {
          const sId = r.sedeId || r.sede_id || r.location?.sedeId || '';
          const secId = r.sectorId || r.sector_id || r.location?.sectorId || '';
          const aId = r.areaId !== undefined ? r.areaId : (r.area_id !== undefined ? r.area_id : (r.location?.areaId ?? 0));

          const location = {
            sedeId: sId,
            sedeName: r.location?.sedeName || r.sedeName || '',
            sectorId: secId,
            sectorName: r.location?.sectorName || r.sectorName || '',
            areaId: typeof aId === 'number' ? aId : Number(aId) || 0,
            areaName: r.location?.areaName || r.areaName || (aId ? `Área ${aId}` : ''),
          };

          const checklist = {
            id: r.checklist?.id || r.checklistId || r.checklist_id || '',
            name: r.checklist?.name || r.checklistName || r.checklist_name || 'Checklist',
            categoryId: r.checklist?.categoryId || r.categoryId || r.category_id || '',
            categoryName: r.checklist?.categoryName || r.categoryName || '',
          };

          return {
            ...r,
            id: r.custom_id || r.code || r.id || r._id,
            location,
            checklist,
            sedeId: sId,
            sectorId: secId,
            areaId: aId,
            startDate: r.startDate || r.start_date || r.revision_date || r.created_at || new Date().toISOString(),
            status: r.status || 'pending',
          };
        });

        setData(normalized);
      } catch (err: any) {
        if (cancelled) return;
        console.error("Error al cargar revisiones:", err);
        setError(err.response?.data?.message || err.message || "No se pudieron cargar las revisiones.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [startDate, endDate, trigger]);

  return { data, loading, error, refresh };
};
