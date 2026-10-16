import { useState } from 'react';
import { Area } from '../../../models/Area';
import { createNewAreaAdapter } from '../adapters/createNewAreaAdapter';

const useCreateArea = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addNewArea = async (areaData: Omit<Area, 'id'>) => {
    setLoading(true);
    setError(null);

    try {
      // Llamada al adaptador para crear una nueva área
      await createNewAreaAdapter(areaData);

      // Retornamos éxito y un mensaje
      return {
        success: true,
        message: 'Área creada exitosamente',
      };
    } catch (err: any) {
      const msg = err?.message || 'Error al crear el área.';
      setError(msg);
      return {
        success: false,
        message: msg,
      };
    } finally {
      setLoading(false);
    }
  };

  return { addNewArea, loading, error };
};

export default useCreateArea;
