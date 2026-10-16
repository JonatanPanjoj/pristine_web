import { useState, useEffect, useCallback } from "react";
import { fetchEnabledSedesInBatchesAdapter } from "../adapters/fetchEnabledSedesInBatchesAdapter ";
import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

export const usePaginatedEnabledSedes = () => {
  const [sedes, setSedes] = useState<DocumentData[]>([]);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMoreSedes = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const { sedes: newSedes, lastDoc: newLastDoc } = await fetchEnabledSedesInBatchesAdapter(lastDoc);
      
      setSedes((prevSedes) => [
        ...prevSedes,
        ...newSedes.filter((newSede) => !prevSedes.some((prev) => prev.id === newSede.id)), // Filtrar duplicados
      ]);

      setLastDoc(newLastDoc); // Actualiza el último documento
      setHasMore(newSedes.length === 10); // Verifica si hay más sedes por cargar
    } catch (error) {
      console.error("Error al cargar más sedes habilitadas:", error);
    } finally {
      setLoading(false);
    }
  }, [loading, lastDoc, hasMore]);

  useEffect(() => {
    loadMoreSedes(); // Carga inicial
  }, []);

  return { sedes, loadMoreSedes, loading, hasMore };
};
