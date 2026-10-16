import { useState } from 'react';
import { Categoria_Checklist } from '../../../models/Categoria_Checklist';
import { createCategoriaChecklist } from '../adapters/createCategoriaChecklist';

const useCreateCategoriaChecklist = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addNewCategoriaChecklist = async (categoriaData: Omit<Categoria_Checklist, 'id' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);

    try {
      // Llamada al adaptador para crear una nueva categoría
      const newId = await createCategoriaChecklist(categoriaData);

      // Retornamos éxito y el ID del nuevo documento
      return {
        success: true,
        message: 'Categoría creada exitosamente',
        id: newId,
      };
    } catch (err) {
      console.error('Error al crear la categoría:', err);
      setError('Error al crear la categoría.');
      return {
        success: false,
        message: 'Error al crear la categoría',
      };
    } finally {
      setLoading(false);
    }
  };

  return { addNewCategoriaChecklist, loading, error };
};

export default useCreateCategoriaChecklist;
