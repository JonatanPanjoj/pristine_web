import { useState } from 'react';
import { uploadImageAdapter, deleteImageAdapter } from '../adapters/uploadImageAdapter';

export const useImageUploader = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (file: File, customName: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await uploadImageAdapter(file, customName); // Pasa el nombre personalizado
      return result;
    } catch (err: any) {
      setError(err.message || 'Error al subir la imagen.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async (imageId: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteImageAdapter(imageId);
      return true;
    } catch (err: any) {
      setError(err.message || 'Error al eliminar la imagen.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { uploadImage, deleteImage, loading, error };
};
