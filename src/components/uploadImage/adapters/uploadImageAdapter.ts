// Subida de imágenes al Servidor 3 (SRV-03 Storage) mediante HTTP REST.
// Las imágenes se almacenan en el volumen persistente de SRV-03 y se sirven públicamente.

const STORAGE_URL = process.env.REACT_APP_STORAGE_URL || 'http://3.130.212.65:8080';

/**
 * Sube un archivo a SRV-03 (Storage) y devuelve los metadatos de la imagen.
 * `id` es el identificador/nombre del archivo guardado.
 * `url` es la URL pública directa accesible desde cualquier navegador o app móvil.
 */
export const uploadImageAdapter = async (file: File, customName: string) => {
  const timestamp = new Date().toISOString();

  try {
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('customName', customName);

    const res = await fetch(`${STORAGE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Error en el servidor de imágenes (HTTP ${res.status}).`);
    }

    const data = await res.json();
    if (!data.url && !data.success) {
      throw new Error(data.message || 'Error al procesar la subida.');
    }

    const url = data.url;
    const id = data.id || data.filename || url.split('/').pop() || `${Date.now()}`;

    return { id, url, name: file.name, date: timestamp };
  } catch (error: any) {
    console.error('[uploadImageAdapter] Error al subir la imagen al Servidor 3:', error);
    throw new Error(error.message || 'No se pudo subir la imagen.');
  }
};

/**
 * Elimina una imagen del Servidor 3.
 */
export const deleteImageAdapter = async (imageId: string) => {
  try {
    const filename = imageId.includes('/') ? imageId.split('/').pop() : imageId;
    const res = await fetch(`${STORAGE_URL}/images/${filename}`, {
      method: 'DELETE',
    });

    if (!res.ok && res.status !== 404) {
      console.warn(`[uploadImageAdapter] Advertencia al eliminar imagen (HTTP ${res.status})`);
    }

    return true;
  } catch (error) {
    console.error('[uploadImageAdapter] Error al eliminar imagen del Servidor 3:', error);
    return false;
  }
};