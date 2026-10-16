// components/PhotoGalleryViewer.tsx
// Visor de un conjunto de fotografías: recorre las fotos con flechas o teclado,
// muestra el contexto de cada una y una tira de miniaturas para saltar directo.
// Lo comparten los reportes de Checklist y los conjuntos de fotos de PPM (activo,
// antes, después), cada uno con SU propio conjunto: nunca se mezclan.

import React, { useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { HiOutlineX, HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineExternalLink } from 'react-icons/hi';
import { FiImage } from 'react-icons/fi';

export interface GalleryPhoto {
  url: string;
  title: string;
  meta: string;
}

interface PhotoGalleryViewerProps {
  photos: GalleryPhoto[];
  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

const PhotoGalleryViewer: React.FC<PhotoGalleryViewerProps> = ({ photos, index, onIndexChange, onClose }) => {
  const isOpen = index !== null && index >= 0 && index < photos.length;

  const goPrev = useCallback(() => {
    if (index === null) return;
    onIndexChange((index - 1 + photos.length) % photos.length);
  }, [index, photos.length, onIndexChange]);

  const goNext = useCallback(() => {
    if (index === null) return;
    onIndexChange((index + 1) % photos.length);
  }, [index, photos.length, onIndexChange]);

  // Teclado: ← → para navegar, Esc para cerrar.
  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') goPrev();
      if (event.key === 'ArrowRight') goNext();
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, goPrev, goNext, onClose]);

  if (!isOpen || index === null) return null;

  const photo = photos[index];
  const hasMany = photos.length > 1;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex flex-col bg-primary-dark/90 backdrop-blur-sm" onMouseDown={onClose}>
      {/* Cabecera con contexto de la revisión */}
      <div
        className="flex items-start justify-between gap-4 px-5 py-4 text-white shrink-0"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="min-w-0">
          <p className="text-sm font-bold truncate">{photo.title}</p>
          <p className="text-xs text-white/60 truncate mt-0.5">{photo.meta}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1.5 rounded-full bg-white/10 text-xs font-bold tabular-nums">
            {index + 1} / {photos.length}
          </span>
          <a
            href={photo.url}
            target="_blank"
            rel="noopener noreferrer"
            title="Abrir original en otra pestaña"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <HiOutlineExternalLink className="w-4 h-4" />
          </a>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Imagen + navegación */}
      <div className="flex-1 flex items-center justify-center gap-3 px-3 min-h-0" onMouseDown={(e) => e.stopPropagation()}>
        {hasMany && (
          <NavButton label="Anterior" onClick={goPrev}>
            <HiOutlineChevronLeft className="w-6 h-6" />
          </NavButton>
        )}

        <GalleryImage url={photo.url} alt={photo.title} />

        {hasMany && (
          <NavButton label="Siguiente" onClick={goNext}>
            <HiOutlineChevronRight className="w-6 h-6" />
          </NavButton>
        )}
      </div>

      {/* Tira de miniaturas */}
      {hasMany && (
        <div
          className="flex gap-2 overflow-x-auto px-5 py-4 shrink-0 scrollbar-none"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {photos.map((item, i) => (
            <button
              key={`${item.url}-${i}`}
              type="button"
              onClick={() => onIndexChange(i)}
              title={item.title}
              className={`w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                i === index ? 'border-primary-gold scale-105' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={item.url} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body
  );
};

const NavButton: React.FC<{ label: string; onClick: () => void; children: React.ReactNode }> = ({
  label,
  onClick,
  children,
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    className="w-11 h-11 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center shrink-0 transition-colors active:scale-95"
  >
    {children}
  </button>
);

// Imagen con estado de carga y aviso si la URL está rota.
const GalleryImage: React.FC<{ url: string; alt: string }> = ({ url, alt }) => {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');

  useEffect(() => setStatus('loading'), [url]);

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center gap-2 text-white/60 p-10">
        <FiImage className="w-10 h-10" />
        <p className="text-sm font-semibold">No se pudo cargar la imagen</p>
        <p className="text-xs text-white/40 break-all max-w-md text-center">{url}</p>
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center max-h-full">
      {status === 'loading' && (
        <div className="absolute w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      )}
      <img
        src={url}
        alt={alt}
        onLoad={() => setStatus('ok')}
        onError={() => setStatus('error')}
        className={`max-w-full max-h-[70vh] rounded-2xl object-contain transition-opacity ${
          status === 'ok' ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};

export default PhotoGalleryViewer;
