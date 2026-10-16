// fetchEnabledSedesFromCache.ts
import { Sede } from '../../../models/Sede';
import { getEnabledSedesFromCache } from '../adapters/getEnabledSedesFromCache';

const fetchEnabledSedesFromCache = async (userId: string) => {
  let sedes: Sede[] = [];
  let error: string | null = null;

  try {
    if (userId) {
      // Llama al adaptador para obtener las sedes habilitadas desde el caché
      sedes = getEnabledSedesFromCache();
    } else {
      sedes = []; // Si no hay `userId`, limpiar las sedes
    }
  } catch (err) {
    error = "Error al obtener las sedes desde el caché.";
    console.error(err);
  }

  return { sedes, error };
};

export default fetchEnabledSedesFromCache;
