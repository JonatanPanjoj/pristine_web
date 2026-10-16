// hooks/useAreasBySectorId.ts
import { useEffect, useState } from "react";
import { Area } from "../../../models/Area";
import { getAreasBySectorIdAdapter } from "../adapters/getAreasBySectorIdAdapter";

export const useAreasBySectorId = (sectorId: string) => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sectorId) return;

    const fetchAreas = async () => {
      setLoading(true);
      setError(null);
      try {
        const areaList = await getAreasBySectorIdAdapter(sectorId);
        setAreas(areaList);
      } catch (err) {
        setError("Error al obtener las áreas.");
      } finally {
        setLoading(false);
      }
    };

    fetchAreas();
  }, [sectorId]);

  return { areas, loading, error };
};
