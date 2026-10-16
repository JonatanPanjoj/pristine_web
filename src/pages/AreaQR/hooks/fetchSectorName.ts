import { getSectorNameById } from "../adapters/getSectorNameById";

const sectorNameCache: Record<string, string | null> = {};

// Función para obtener el nombre de un sector por su ID con cache
export const fetchSectorName = async (sectorId: string): Promise<string | null> => {
  if (!sectorId) return null;
  if (sectorId in sectorNameCache) {
    return sectorNameCache[sectorId];
  }

  try {
    const sectorName = await getSectorNameById(sectorId);
    sectorNameCache[sectorId] = sectorName;
    return sectorName;
  } catch (error) {
    console.error("Error al obtener el nombre del sector:", error);
    return null;
  }
};
