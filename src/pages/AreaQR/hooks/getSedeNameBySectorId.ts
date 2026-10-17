import { resolveAreaLocation } from '../services/areaLocationResolver';

// Función para obtener el nombre de la sede dado un sectorId
const getSedeNameBySectorId = async (sectorId: string): Promise<string | null> => {
  if (!sectorId) return null;
  try {
    const info = await resolveAreaLocation({ SectorId: sectorId, sector_id: sectorId });
    return info.sedeName;
  } catch (error) {
    console.error('Error al obtener el nombre de la sede:', error);
    return null;
  }
};

export default getSedeNameBySectorId;
