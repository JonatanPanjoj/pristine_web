import { useState } from "react";
import { toggleCategoriaStatus } from "../adapters/toggleCategoriaStatus"; // Importar la función del adaptador

export const useToggleCategoriaStatus = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleStatus = async (categoriaId: string) => {
    setLoading(true);
    setError(null);
    try {
      const newStatus = await toggleCategoriaStatus(categoriaId); // Llama a la función que cambia el estado de la categoría
      return newStatus;
    } catch (err: any) {
      setError(err.message || "Error al cambiar el estado de la categoría.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { toggleStatus, loading, error };
};
