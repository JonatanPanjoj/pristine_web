// hooks/useSchedulesByDate.ts
// Reemplaza: useEnabledProgramingsAndListsBySpecificDate
// Cambios:   usa getSchedulesByDateAdapter (camelCase, activeDays, status string)
//            El auto-fetch inicial ya no lanza con SedeId null — espera params reales

import { useState, useCallback } from "react";
import {
  getSchedulesByDateAdapter,
  GetSchedulesByDateParams,
  ScheduleByDateResult,
} from "../adapters/getSchedulesByDateAdapter";

interface UseSchedulesByDateReturn {
  data: ScheduleByDateResult[] | null;
  loading: boolean;
  error: string | null;
  fetchSchedules: (params: GetSchedulesByDateParams) => Promise<void>;
}

export const useSchedulesByDate = (): UseSchedulesByDateReturn => {
  const [data, setData] = useState<ScheduleByDateResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = useCallback(async (params: GetSchedulesByDateParams) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getSchedulesByDateAdapter(params);
      setData(result);
    } catch (err) {
      setError((err as Error).message || "Could not load schedules.");
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchSchedules };
};
