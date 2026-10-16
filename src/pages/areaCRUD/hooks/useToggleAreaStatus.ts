import { useState } from "react";
import { toggleAreaStatus } from "../adapters/toggleAreaStatusAdapter"; // Importar la función del adaptador

export const useToggleAreaStatus = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleStatus = async (areaId: string) => {
    setLoading(true);
    setError(null);
    try {
      const newStatus = await toggleAreaStatus(areaId); // Llama a la función que cambia el estado del área
      return newStatus;
    } catch (err: any) {
      setError(err.message || "Error al cambiar el estado del área.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { toggleStatus, loading, error };
};
