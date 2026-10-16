// hooks/useActiveSchedules.ts
// Reemplaza: useEnabledProgramingsAndLists
// Cambios:   usa getActiveSchedulesAdapter (colección "schedules", activeDays)
//            isLoading → loading para consistencia con el resto de hooks

import { useState, useEffect, useCallback } from "react";
import {
  getActiveSchedulesAdapter,
  ActiveScheduleResult,
} from "../adapters/getActiveSchedulesAdapter";

interface UseActiveSchedulesReturn {
  data: ActiveScheduleResult[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export const useActiveSchedules = (): UseActiveSchedulesReturn => {
  const [data, setData] = useState<ActiveScheduleResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getActiveSchedulesAdapter();
      setData(result);
    } catch (err) {
      setError("Could not load active schedules.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-carga al montar — mismo comportamiento que el hook anterior
  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
};
