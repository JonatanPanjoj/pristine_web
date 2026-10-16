// fetchSectorName.ts
import { getSectorNameById } from "../adapters/getSectorNameById";

// Función para obtener el nombre de un sector por su ID
export const fetchSectorName = async (sectorId: string): Promise<string | null> => {
  try {
    // Llamar al adaptador para obtener el nombre del sector
    const sectorName = await getSectorNameById(sectorId);
    return sectorName;
  } catch (error) {
    console.error("Error al obtener el nombre del sector:", error);
    return null;
  }
};
