import { useState } from "react";
import { toggleScheduleStatusAdapter } from "../../adapters/programmings/toggleScheduleStatusAdapter";

export const useToggleScheduleStatus = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleStatus = async (scheduleId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await toggleScheduleStatusAdapter(scheduleId);
      return result;
    } catch (err: any) {
      setError(err.message || "Error al cambiar el estado del schedule.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { toggleStatus, loading, error };
};

export default useToggleScheduleStatus;
