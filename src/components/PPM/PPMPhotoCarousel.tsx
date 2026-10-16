// components/PPM/PPMPhotoCarousel.tsx
// Carrusel de un solo conjunto de fotos: una para el activo, otra para el antes
// y otra para el después. Nunca mezcla conjuntos, que es lo que desordenaba la
// galería única. Al hacer clic en la foto se abre el visor a pantalla completa
// con ese mismo conjunto; en el documento se despliegan todas en rejilla.
//
// Lo que se ve en pantalla y lo que va al papel se reparten con las clases de
// ppmPrint.css (.ppm-no-print y .ppm-print-grid), no con las variantes `print:`
// de Tailwind: esas compilan a @media print y la descarga directa a PDF, que
// rasteriza la vista, nunca llega a evaluarlas.

import React, { useEffect, useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiCamera, FiMaximize2 } from 'react-icons/fi';
import PhotoGalleryViewer, { GalleryPhoto } from '../PhotoGalleryViewer';

interface PPMPhotoCarouselProps {
  photos: string[];
  /** Rótulo de las fotos y del contador. */
  label?: string;
  emptyMessage?: string;
  /** Alto del visor; los paneles laterales usan el compacto. */
  size?: 'compact' | 'regular';
}

const HEIGHTS: Record<NonNullable<PPMPhotoCarouselProps['size']>, string> = {
  compact: 'h-32',
  regular: 'h-64',
};

export const PPMPhotoCarousel: React.FC<PPMPhotoCarouselProps> = ({
  photos,
  label = 'Fotografía',
  emptyMessage = 'Sin fotografías.',
  size = 'regular',
}) => {
  const [index, setIndex] = useState(0);
  const [zoomIndex, setZoomIndex] = useState<number | null>(null);

  // Si cambia el conjunto (otra orden de trabajo, otro activo) se vuelve a la primera.
  const photosKey = photos.join('|');
  useEffect(() => setIndex(0), [photosKey]);

  if (photos.length === 0) {
    return (
      <div className={`${HEIGHTS[size]} rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center gap-2 text-xs text-slate-400 font-medium`}>
        <FiCamera className="w-4 h-4" /> {emptyMessage}
      </div>
    );
  }

  const position = Math.min(index, photos.length - 1);
  const go = (step: number) => setIndex((prev) => (prev + step + photos.length) % photos.length);

  return (
    <div>
      <div className={`relative ${HEIGHTS[size]} rounded-2xl overflow-hidden border border-slate-200 bg-slate-900/5 ppm-no-print`}>
        <button
          type="button"
          onClick={() => setZoomIndex(position)}
          title="Ampliar y recorrer estas fotos"
          className="w-full h-full cursor-zoom-in"
        >
          <img src={photos[position]} alt={`${label} ${position + 1}`} className="w-full h-full object-contain" />
        </button>

        {photos.length > 1 && (
          <>
            <CarouselArrow side="left" onClick={() => go(-1)} />
            <CarouselArrow side="right" onClick={() => go(1)} />
          </>
        )}

        <span className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/60 text-white pointer-events-none">
          <FiMaximize2 className="w-3.5 h-3.5" />
        </span>

        <span className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full bg-slate-900/60 text-white text-[10px] font-bold pointer-events-none">
          {label} {position + 1} / {photos.length}
        </span>
      </div>

      {photos.length > 1 && (
        <div className="flex flex-wrap gap-2 mt-2 ppm-no-print">
          {photos.map((url, thumbPosition) => (
            <button
              key={`${url}-${thumbPosition}`}
              type="button"
              onClick={() => setIndex(thumbPosition)}
              title={`${label} ${thumbPosition + 1}`}
              className={`w-12 h-12 rounded-xl overflow-hidden border transition-all ${
                thumbPosition === position
                  ? 'border-primary-gold ring-2 ring-primary-gold/40'
                  : 'border-slate-200 opacity-70 hover:opacity-100'
              }`}
            >
              <img src={url} alt={`${label} ${thumbPosition + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* En papel no hay carrusel: salen todas, cada una con su proporción. Un
          alto fijo las recortaba en pantalla y las deformaba en el PDF, porque
          html2canvas ignora `object-fit` y estira la foto hasta su caja. */}
      <div className="ppm-print-grid grid-cols-4 gap-2 items-start">
        {photos.map((url, printPosition) => (
          <img
            key={`print-${url}-${printPosition}`}
            src={url}
            alt={`${label} ${printPosition + 1}`}
            className="w-full h-auto max-w-[260px] mx-auto rounded-lg border border-slate-200"
          />
        ))}
      </div>

      <PhotoGalleryViewer
        photos={toGalleryPhotos(photos, label)}
        index={zoomIndex}
        onIndexChange={setZoomIndex}
        onClose={() => setZoomIndex(null)}
      />
    </div>
  );
};

const CarouselArrow: React.FC<{ side: 'left' | 'right'; onClick: () => void }> = ({ side, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    title={side === 'left' ? 'Anterior' : 'Siguiente'}
    className={`absolute top-1/2 -translate-y-1/2 ${side === 'left' ? 'left-2' : 'right-2'} w-8 h-8 rounded-full bg-slate-900/60 text-white flex items-center justify-center hover:bg-slate-900 active:scale-95 transition-all`}
  >
    {side === 'left' ? <FiChevronLeft className="w-4 h-4" /> : <FiChevronRight className="w-4 h-4" />}
  </button>
);

const toGalleryPhotos = (photos: string[], label: string): GalleryPhoto[] =>
  photos.map((url, position) => ({
    url,
    title: label,
    meta: `Foto ${position + 1} de ${photos.length}`,
  }));

export default PPMPhotoCarousel;
