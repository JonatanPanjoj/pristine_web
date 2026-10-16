import React, { useState } from 'react';
import { useImageUploader } from '../hooks/useImageUploader';

interface ImageUploaderProps {
  onUpload: (imageData: { id: string; url: string; name: string; date: string }) => void;
  customName: string; // Agregamos el nombre personalizado como prop
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload, customName }) => {
  const { uploadImage, deleteImage, loading, error } = useImageUploader();
  const [uploadedImage, setUploadedImage] = useState<{ id: string; url: string; name: string; date: string } | null>(
    null
  );
  const [uploading, setUploading] = useState(false); // Estado para manejar el feedback de carga

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setUploading(true); // Muestra el feedback de "Cargando imagen..."
      const result = await uploadImage(file, customName); // Pasa el nombre personalizado al subir
      if (result) {
        setUploadedImage(result);
        onUpload(result);
      }
      setUploading(false); // Oculta el feedback al terminar
    }
  };

  const handleDelete = async () => {
    if (uploadedImage) {
      const success = await deleteImage(uploadedImage.id);
      if (success) {
        setUploadedImage(null);
        console.log('Imagen eliminada.');
      }
    }
  };

  return (
    <div className="p-4 border rounded bg-gray-50">
      <h2 className="text-lg font-semibold mb-4">Subir Imagen</h2>
      <div className="flex flex-col gap-4">
        {/* Botón de selección de archivo */}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={loading || uploading} // Desactiva mientras carga
          className="file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-full file:bg-blue-500 file:text-white file:cursor-pointer hover:file:bg-blue-600"
        />

        {/* Feedback de carga */}
        {uploading && (
          <p className="text-blue-500 text-sm font-semibold animate-pulse">
            Cargando imagen, por favor espera...
          </p>
        )}

        {/* Imagen subida */}
        {uploadedImage && (
          <div className="flex flex-col items-center gap-2">
            <img src={uploadedImage.url} alt={uploadedImage.name} className="max-w-xs rounded shadow" />
            <p className="text-sm text-gray-600">Nombre: {uploadedImage.name}</p>
            <p className="text-sm text-gray-600">Fecha: {uploadedImage.date}</p>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
            >
              {loading ? 'Eliminando...' : 'Eliminar Imagen'}
            </button>
          </div>
        )}

        {/* Mensaje de error */}
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </div>
  );
};

export default ImageUploader;
