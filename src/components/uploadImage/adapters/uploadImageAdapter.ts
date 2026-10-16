// Subida de imágenes a S3 mediante presigned URLs firmadas por API Gateway + Lambda.
// El frontend NUNCA ve credenciales de AWS: solo pide una URL temporal y sube el archivo directo a S3.
//
// Variables de entorno requeridas (.env, prefijo REACT_APP_ obligatorio en CRA):
//   REACT_APP_S3_API_URL          -> endpoint de API Gateway, p.ej. https://abc123.execute-api.us-east-1.amazonaws.com/prod
//   REACT_APP_S3_PUBLIC_BASE_URL  -> base estable de lectura (dominio de CloudFront), p.ej. https://dxxxx.cloudfront.net

const API_URL = process.env.REACT_APP_S3_API_URL;
const PUBLIC_BASE_URL = process.env.REACT_APP_S3_PUBLIC_BASE_URL;

if (!API_URL || !PUBLIC_BASE_URL) {
  // Falla temprano y claro si falta configuración, en lugar de errores de red opacos.
  console.warn('[uploadImageAdapter] Faltan REACT_APP_S3_API_URL o REACT_APP_S3_PUBLIC_BASE_URL en el .env');
}

/**
 * Sube un archivo a S3 y devuelve los metadatos de la imagen.
 * `id` es la KEY completa en S3 (se usa luego para borrar).
 * `url` es una URL estable de lectura (CloudFront) que se puede guardar en Firestore.
 */
export const uploadImageAdapter = async (file: File, customName: string) => {
  const timestamp = new Date().toISOString();
  // Sanitiza el nombre para que sea una key válida y única dentro del bucket.
  const safeName = `${customName}-${timestamp}`.replace(/[^a-zA-Z0-9._-]/g, '_');
  const key = `checklistRevision/${safeName}`;

  try {
    // 1. Pedir a la Lambda una presigned PUT URL.
    const presignRes = await fetch(`${API_URL}/images`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, contentType: file.type }),
    });

    if (!presignRes.ok) {
      throw new Error(`No se pudo obtener la URL de subida (HTTP ${presignRes.status}).`);
    }

    const { uploadUrl } = (await presignRes.json()) as { uploadUrl: string };

    // 2. Subir el archivo directo a S3 con la URL firmada.
    //    El Content-Type debe coincidir con el que se firmó en la Lambda.
    const putRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });

    if (!putRes.ok) {
      throw new Error(`Falló la subida a S3 (HTTP ${putRes.status}).`);
    }

    // 3. URL pública estable de lectura (vía CloudFront).
    const url = `${PUBLIC_BASE_URL}/${key}`;

    return { id: key, url, name: file.name, date: timestamp };
  } catch (error) {
    console.error('Error al subir la imagen:', error);
    throw new Error('No se pudo subir la imagen.');
  }
};

/**
 * Elimina una imagen de S3. `imageId` es la KEY completa devuelta por uploadImageAdapter.
 */
export const deleteImageAdapter = async (imageId: string) => {
  try {
    const res = await fetch(`${API_URL}/images?key=${encodeURIComponent(imageId)}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      throw new Error(`No se pudo eliminar la imagen (HTTP ${res.status}).`);
    }

    return true;
  } catch (error) {
    console.error('Error al eliminar la imagen:', error);
    throw new Error('No se pudo eliminar la imagen.');
  }
};