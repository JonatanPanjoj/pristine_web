import { useState } from "react";
import { toggleChecklistStatusAdapter } from "../adapters/toggleChecklistStatusAdapter";

export const useToggleChecklistStatus = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleStatus = async (checklistId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await toggleChecklistStatusAdapter(checklistId);
      return result;
    } catch (err: any) {
      setError(err.message || "Error al cambiar el estado del checklist.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { toggleStatus, loading, error };
};

export default useToggleChecklistStatus;
