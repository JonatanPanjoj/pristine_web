// useEnabledSedesFromCache.ts
import { useState, useEffect } from 'react';
import { Sede } from '../../../models/Sede';
import { getEnabledSedesFromCache } from '../adapters/getEnabledSedesFromCache';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';

const useEnabledSedesFromCache = (reload = false) => { // Añadimos `reload` como parámetro opcional
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const userId = useSelector((state: RootState) => state.user.user?.id);

  useEffect(() => {
    const fetchSedes = () => {
      setLoading(true);
      setError(null);

      try {
        if (userId) {
          // Llama al adaptador para obtener las sedes habilitadas desde el caché
          const fetchedSedes = getEnabledSedesFromCache();
          setSedes(fetchedSedes);
        } else {
          setSedes([]); // Si no hay `userId`, limpiar las sedes
        }
      } catch (err) {
        setError("Error al obtener las sedes desde el caché.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSedes();
  }, [userId, reload]); // Agrega `reload` como dependencia para forzar la recarga

  return { sedes, loading, error };
};

export default useEnabledSedesFromCache;
