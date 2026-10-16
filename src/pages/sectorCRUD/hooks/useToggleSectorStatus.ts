import { useState } from "react";
import { toggleSectorStatus } from "../adapters/toggleSectorStatusAdapter"; // Importar la función del adaptador

export const useToggleSectorStatus = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleStatus = async (sectorId: string) => {
    setLoading(true);
    setError(null);
    try {
      const newStatus = await toggleSectorStatus(sectorId); // Llama a la función que cambia el estado del sector
      return newStatus;
    } catch (err: any) {
      setError(err.message || "Error al cambiar el estado del sector.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { toggleStatus, loading, error };
};
