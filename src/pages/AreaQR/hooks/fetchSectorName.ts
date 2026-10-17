import { resolveAreaLocation } from '../services/areaLocationResolver';

// Función para obtener el nombre de un sector por su ID
export const fetchSectorName = async (sectorId: string): Promise<string | null> => {
  if (!sectorId) return null;
  try {
    const info = await resolveAreaLocation({ SectorId: sectorId, sector_id: sectorId });
    return info.sectorName;
  } catch (error) {
    console.error('Error al obtener el nombre del sector:', error);
    return null;
  }
};
