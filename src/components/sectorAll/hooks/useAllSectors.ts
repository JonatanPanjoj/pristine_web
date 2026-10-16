import { useState, useEffect } from 'react';
import { getAllSectorsAdapter } from '../adapters/getAllSectorsAdapter'; // Asegúrate de que la ruta sea correcta
import { Sector } from '../../../models/Sector';

interface UseAllSectorsOptions {
  searchFields?: Partial<Omit<Sector, 'id' | 'created_at'>>; // Campos de búsqueda opcionales
  sedeIds?: string[]; // Array de IDs de sede
}

const useAllSectors = (options: UseAllSectorsOptions = {}) => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSectors = async () => {
      setLoading(true);
      setError(null);

      try {
        // Llamada al adaptador para obtener los sectores
        const { sectors: fetchedSectors } = await getAllSectorsAdapter(options);
        setSectors(fetchedSectors);
      } catch (err) {
        setError('Error al obtener los sectores.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    // Ejecutar la función para cargar los sectores solo si hay sedeIds
    if (options.sedeIds && options.sedeIds.length > 0) {
      fetchSectors();
    }
  }, [options.sedeIds]); // Dependencias actualizadas para solo volver a ejecutar cuando cambie sedeIds

  return { sectors, loading, error };
};

export default useAllSectors;
