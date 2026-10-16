// components/PPM/PPMPhotoGalleryButton.tsx
// Acceso a las fotos desde una celda de reporte: un solo botón "Ver galería" que
// abre el visor con ESE conjunto y solo ese. En la tabla no cabe un carrusel y
// mezclar los conjuntos en una galería común desordena las fotos.

import React, { useState } from 'react';
import { FiImage } from 'react-icons/fi';
import PhotoGalleryViewer, { GalleryPhoto } from '../PhotoGalleryViewer';

interface PPMPhotoGalleryButtonProps {
  photos: string[];
  /** Título que acompaña a cada foto dentro del visor. */
  title?: string;
  /** Contexto bajo el título (activo, fecha, ubicación…). */
  meta?: string;
}

export const PPMPhotoGalleryButton: React.FC<PPMPhotoGalleryButtonProps> = ({
  photos,
  title = 'Fotografía',
  meta = '',
}) => {
  const [index, setIndex] = useState<number | null>(null);

  if (photos.length === 0) return <span className="text-neutral-400">—</span>;

  return (
    <>
      <button
        type="button"
        onClick={() => setIndex(0)}
        title={`Ver las ${photos.length} fotografías`}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-gold/10 text-primary-gold text-[11px] font-bold hover:bg-primary-gold/20 active:scale-95 transition-all mx-auto"
      >
        <FiImage className="w-3.5 h-3.5" />
        Ver galería ({photos.length})
      </button>

      <PhotoGalleryViewer
        photos={toGalleryPhotos(photos, title, meta)}
        index={index}
        onIndexChange={setIndex}
        onClose={() => setIndex(null)}
      />
    </>
  );
};

const toGalleryPhotos = (photos: string[], title: string, meta: string): GalleryPhoto[] =>
  photos.map((url, position) => ({
    url,
    title,
    meta: [meta, `Foto ${position + 1} de ${photos.length}`].filter(Boolean).join(' · '),
  }));

export default PPMPhotoGalleryButton;
