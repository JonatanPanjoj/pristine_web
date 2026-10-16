// components/ReportPhotoThumb.tsx
// Celda de fotografía de una revisión: miniatura clicable que abre la galería.
// Compartida por el reporte en línea y por la vista del resultado en pestaña nueva.

import React, { useState } from 'react';
import { FiImage } from 'react-icons/fi';

interface ReportPhotoThumbProps {
  url: string | null | undefined;
  onOpen: (url: string) => void;
}

export const ReportPhotoThumb: React.FC<ReportPhotoThumbProps> = ({ url, onOpen }) => {
  const [failed, setFailed] = useState(false);

  if (!url) return <span className="text-neutral-400">—</span>;

  if (failed) {
    return (
      <span className="inline-flex items-center gap-1 text-neutral-400 text-[11px]" title={url}>
        <FiImage className="w-3 h-3 flex-shrink-0" />
        No disponible
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onOpen(url)}
      title="Ver fotografía de la revisión"
      className="group inline-flex items-center gap-2 mx-auto"
    >
      <img
        src={url}
        alt="Fotografía de la revisión"
        loading="lazy"
        onError={() => setFailed(true)}
        className="w-9 h-9 rounded-lg object-cover border border-neutral-200 shadow-sm group-hover:ring-2 group-hover:ring-primary-gold/50 transition-all"
      />
      <span className="text-primary-gold font-semibold text-[11px] group-hover:underline">Ver</span>
    </button>
  );
};

export default ReportPhotoThumb;
