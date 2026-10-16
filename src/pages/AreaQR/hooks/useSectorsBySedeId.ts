// useSectorsBySedeId.ts
import { useEffect, useState } from "react";
import { getSectorsBySedeId } from "../adapters/getSectorsBySedeId";
import { Sector } from "../../../models/Sector";

export const useSectorsBySedeId = (sedeId: string) => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSectors = async () => {
      setLoading(true);
      setError(null);
      try {
        const sectorsList = await getSectorsBySedeId(sedeId);
        setSectors(sectorsList);
      } catch (err) {
        setError("Error al obtener los sectores.");
      } finally {
        setLoading(false);
      }
    };

    if (sedeId) {
      fetchSectors();
    }
  }, [sedeId]);

  return { sectors, loading, error };
};
