import { useState } from "react";
import { ChecklistSchedule } from "../../../../models/ChecklistSchedule";
import { editScheduleAdapter } from "../../adapters/programmings/editScheduleAdapter";

export const useEditSchedule = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editSchedule = async (
    schedule: ChecklistSchedule
  ): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    setError(null);
    try {
      await editScheduleAdapter(schedule);
      return { success: true, message: "Schedule editado exitosamente" };
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      return { success: false, message: errorMessage || "Error al editar el schedule" };
    } finally {
      setLoading(false);
    }
  };

  return { editSchedule, loading, error };
};
