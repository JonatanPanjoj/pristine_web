import { useState } from "react";
import { Checklist } from "../../../models/Checklist";
import { editChecklistAdapter } from "../adapters/editChecklistAdapter";

export const useEditChecklist = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editChecklist = async (
    checklist: Checklist
  ): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    setError(null);
    try {
      await editChecklistAdapter(checklist);
      return { success: true, message: "Checklist editado exitosamente" };
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      return { success: false, message: errorMessage || "Error al editar el checklist" };
    } finally {
      setLoading(false);
    }
  };

  return { editChecklist, loading, error };
};
