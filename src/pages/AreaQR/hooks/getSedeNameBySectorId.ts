import { getSedeById } from '../adapters/getSedeBySectorId';

const sedeNameCache: Record<string, string | null> = {};

// Función simple para obtener el nombre de la sede dado un sectorId con cache
const getSedeNameBySectorId = async (sectorId: string): Promise<string | null> => {
  if (!sectorId) return null;
  if (sectorId in sedeNameCache) {
    return sedeNameCache[sectorId];
  }

  try {
    const result = await getSedeById(sectorId);
    sedeNameCache[sectorId] = result;
    return result;
  } catch (error) {
    console.error('Error al obtener el nombre de la sede:', error);
    return null;
  }
};

export default getSedeNameBySectorId;
