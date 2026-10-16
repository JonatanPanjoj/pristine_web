import { useState } from "react";
import { Checklist } from "../../../models/Checklist";
import { createChecklistAdapter } from "../adapters/createChecklistAdapter";

const useCreateChecklist = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addNewChecklist = async (
    checklistData: Omit<Checklist, "id">
  ): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    setError(null);
    try {
      await createChecklistAdapter(checklistData);
      return { success: true, message: "Checklist creado exitosamente" };
    } catch (err) {
      setError("Error al crear el checklist.");
      return { success: false, message: "Error al crear el checklist" };
    } finally {
      setLoading(false);
    }
  };

  return { addNewChecklist, loading, error };
};

export default useCreateChecklist;
