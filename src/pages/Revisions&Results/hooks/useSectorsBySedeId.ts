import { useEffect, useState } from "react";
import { Sector } from "../../../models/Sector";
import { getSectorsBySedeIdAdapter } from "../adapters/getSectorsBySedeIdAdapter";

export const useSectorsBySedeId = (sedeId: string) => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sedeId) return;

    const fetchSectors = async () => {
      setLoading(true);
      setError(null);
      try {
        const sectorList = await getSectorsBySedeIdAdapter(sedeId);
        setSectors(sectorList);
      } catch (err) {
        setError("Error al obtener los sectores.");
      } finally {
        setLoading(false);
      }
    };

    fetchSectors();
  }, [sedeId]);

  return { sectors, loading, error };
};
