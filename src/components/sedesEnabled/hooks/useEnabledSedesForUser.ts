import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { getEnabledSedesForUser } from '../adapters/getEnabledSedesForUser';
import { Sede } from '../../../models/Sede';

const useEnabledSedesForUser = () => {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Obtén el `userId` del estado global de Redux
  const userId = useSelector((state: RootState) => state.user.user?.id);

  useEffect(() => {
    const fetchSedes = async () => {
      setLoading(true);
      setError(null);

      try {
        if (userId) {
          // Llama al adaptador para obtener las sedes habilitadas como objetos completos
          const fetchedSedes = getEnabledSedesForUser(userId); // El adaptador ya devuelve `Sede[]`
          setSedes(fetchedSedes);
        } else {
          setSedes([]); // Si `userId` no está presente, limpia las sedes
        }
      } catch (err) {
        setError("Error al obtener las sedes.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSedes();
  }, [userId]);

  return { sedes, loading, error };
};

export default useEnabledSedesForUser;
