import { useState } from 'react';
import { Sede } from '../../../models/Sede';
import { createNewSedeAdapter } from '../adapters/createNewSedeAdapter';
import { loadAndUpdateSedes } from '../../../services/sedeStorage';

const useCreateSede = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addNewSede = async (sedeData: Omit<Sede, 'id'>) => {
    setLoading(true);
    setError(null);

    try {
      // Llamada al adaptador para crear una nueva sede
      await createNewSedeAdapter(sedeData);

      // Retornamos éxito y un mensaje
      loadAndUpdateSedes();
      
      return {
        success: true,
        message: 'Sede creada exitosamente',
        
      };
    } catch (err) {
      setError('Error al crear la sede.');
      return {
        success: false,
        message: 'Error al crear la sede',
      };
    } finally {
      setLoading(false);
    }
  };

  return { addNewSede, loading, error };
};

export default useCreateSede;
