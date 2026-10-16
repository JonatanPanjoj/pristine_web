import { useState } from 'react';
import { Sector } from '../../../models/Sector';
import { createNewSectorAdapter } from '../adapters/createNewSectorAdapter';

const useCreateSector = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addNewSector = async (sectorData: Omit<Sector, 'id'>) => {
    setLoading(true);
    setError(null);

    try {
      // Llamada al adaptador para crear un nuevo sector
      await createNewSectorAdapter(sectorData);

      // Retornamos éxito y un mensaje
      return {
        success: true,
        message: 'Sector creado exitosamente',
      };
    } catch (err) {
      setError('Error al crear el sector.');
      return {
        success: false,
        message: 'Error al crear el sector',
      };
    } finally {
      setLoading(false);
    }
  };

  return { addNewSector, loading, error };
};

export default useCreateSector;
