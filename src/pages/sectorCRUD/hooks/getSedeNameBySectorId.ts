import { getSedeById } from '../adapters/getSedeBySectorId'; // Asegúrate de que la ruta sea correcta

// Función simple para obtener el nombre de la sede dado un sectorId
const getSedeNameBySectorId = async (sectorId: string): Promise<string | null> => {
  try {
    const result = await getSedeById(sectorId); // Llamada al adaptador
    return result; // Devolver el nombre de la sede (puede ser null si no se encuentra)
  } catch (error) {
    console.error('Error al obtener el nombre de la sede:', error);
    return null; // Devolver null si hay algún error
  }
};

export default getSedeNameBySectorId;
