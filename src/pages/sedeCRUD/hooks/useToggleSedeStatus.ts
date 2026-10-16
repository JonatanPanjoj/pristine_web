import { useState } from "react";
import { toggleSedeStatus } from "../adapters/toggleSedeStatusAdapter"; // Importar la función del adaptador
import { loadAndUpdateSedes } from "../../../services/sedeStorage";

export const useToggleSedeStatus = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleStatus = async (sedeId: string) => {
    setLoading(true);
    setError(null);
    try {
      const newStatus = await toggleSedeStatus(sedeId); // Llama a la función que cambia el estado de la sede
      loadAndUpdateSedes();
      
      return newStatus;
    } catch (err: any) {
      setError(err.message || "Error al cambiar el estado de la sede.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { toggleStatus, loading, error };
};


