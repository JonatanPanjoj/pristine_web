import { useState } from "react";
import { ChecklistSchedule } from "../../../../models/ChecklistSchedule";
import { createScheduleAdapter } from "../../adapters/programmings/createScheduleAdapter";

const useCreateSchedule = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addNewSchedule = async (
    scheduleData: Omit<ChecklistSchedule, "id">
  ): Promise<{ newScheduleId?: string; success: boolean; message: string }> => {
    setLoading(true);
    setError(null);
    try {
      const newScheduleId = await createScheduleAdapter(scheduleData);
      return { newScheduleId, success: true, message: "Schedule creado exitosamente" };
    } catch (err) {
      setError("Error al crear el schedule.");
      return { success: false, message: "Error al crear el schedule" };
    } finally {
      setLoading(false);
    }
  };

  return { addNewSchedule, loading, error };
};

export default useCreateSchedule;
