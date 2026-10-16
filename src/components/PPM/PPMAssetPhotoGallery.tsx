// components/PPM/PPMAssetPhotoGallery.tsx
// Galería de referencia de las fotos del activo. La usan la ficha de la OT y la
// vista de trabajar la orden de trabajo, donde el técnico necesita ver cómo es el equipo
// antes de intervenirlo.

import React from 'react';
import { FiCamera } from 'react-icons/fi';
import { PPMPhotoCarousel } from './PPMPhotoCarousel';
import { PPMAsset } from '../../models/PPM';

interface PPMAssetPhotoGalleryProps {
  asset?: PPMAsset;
  title?: string;
  emptyMessage?: string;
  className?: string;
}

export const PPMAssetPhotoGallery: React.FC<PPMAssetPhotoGalleryProps> = ({
  asset,
  title = 'Fotografías del activo',
  emptyMessage = 'El activo no tiene fotografías registradas.',
  className = '',
}) => {
  const photoUrls = buildAssetPhotos(asset);

  return (
    <div className={`bg-white rounded-[32px] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border-0 ppm-print-block ${className}`}>
      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
        <FiCamera className="w-4 h-4 text-primary-gold" /> {title}
        {photoUrls.length > 0 && <span className="text-slate-400 font-semibold">({photoUrls.length})</span>}
      </h3>

      <PPMPhotoCarousel photos={photoUrls} label="Foto del activo" emptyMessage={emptyMessage} />
    </div>
  );
};

/** Galería completa; `imageUrl` es el respaldo de los registros antiguos. */
export const buildAssetPhotos = (asset?: PPMAsset): string[] => {
  if (!asset) return [];
  const gallery = (asset.photos ?? []).slice().sort((a, b) => a.position - b.position).map((photo) => photo.url);
  if (gallery.length > 0) return gallery;
  return asset.imageUrl ? [asset.imageUrl] : [];
};

export default PPMAssetPhotoGallery;
