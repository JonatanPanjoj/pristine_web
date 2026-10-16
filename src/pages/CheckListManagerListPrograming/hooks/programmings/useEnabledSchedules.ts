import { useEffect, useState } from "react";
import { ChecklistSchedule } from "../../../../models/ChecklistSchedule";
import { getEnabledSchedulesAdapter } from "../../adapters/programmings/getEnabledSchedulesAdapter";

const useEnabledSchedules = (checklistId: string) => {
  const [schedules, setSchedules] = useState<ChecklistSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!checklistId) return;

    const fetchEnabledSchedules = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedSchedules = await getEnabledSchedulesAdapter(checklistId);
        setSchedules(fetchedSchedules);
      } catch (err) {
        setError("Error al cargar los schedules habilitados.");
      } finally {
        setLoading(false);
      }
    };

    fetchEnabledSchedules();
  }, [checklistId]);

  return { schedules, loading, error };
};

export default useEnabledSchedules;
