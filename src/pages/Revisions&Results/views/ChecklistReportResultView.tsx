// views/ChecklistReportResultView.tsx
// Vista web standalone del RESULTADO de un reporte, abierta en una pestaña nueva
// desde cualquier reporte cuando "Generar en otra pestaña" está marcado. Lee el
// payload guardado en localStorage por :resultId y lo renderiza como tabla
// premium. La sesión se rehidrata desde redux-persist, así que la pestaña
// conserva la autenticación.

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineDocumentReport } from 'react-icons/hi';
import { FiImage } from 'react-icons/fi';
import { readReportResult } from '../utils/reportResult';
import ReportResultTable from '../components/ReportResultTable';
import ReportPhotoThumb from '../components/ReportPhotoThumb';
import PhotoGalleryViewer from '../../../components/PhotoGalleryViewer';
import { PPMPhotoGalleryButton } from '../../../components/PPM/PPMPhotoGalleryButton';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

const ChecklistReportResultView: React.FC = () => {
  const { resultId } = useParams<{ resultId: string }>();
  const payload = resultId ? readReportResult(resultId) : null;
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);

  if (!payload) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3 text-slate-400">
        <HiOutlineDocumentReport className="w-12 h-12 text-slate-200" />
        <p className="text-sm font-semibold text-slate-700">Resultado no disponible</p>
        <p className="text-xs text-slate-400">El resultado expiró o la dirección no es válida. Vuelve a generarlo.</p>
      </div>
    );
  }

  const generatedAt = new Date(payload.createdAt).toLocaleString('es-GT');
  const photos = payload.photos ?? [];
  const photoSets = payload.photoSets ?? [];
  const photoIndexOf = (url: string) => photos.findIndex((p) => p.url === url);

  // Cada conjunto abre solo sus fotos de esa fila: la galería común mezclaba las
  // de todas las filas y columnas, y se perdía el orden.
  const renderCell = (value: string | number, rowIndex: number, colIndex: number): React.ReactNode => {
    const set = photoSets.find((candidate) => candidate.columnIndex === colIndex);
    if (set) {
      return (
        <PPMPhotoGalleryButton
          photos={set.photosByRow[rowIndex] ?? []}
          title={`${payload.title} · ${set.label}`}
          meta={String(payload.rows[rowIndex]?.[0] ?? '')}
        />
      );
    }

    if (colIndex === payload.photoColumnIndex) {
      return (
        <ReportPhotoThumb
          url={typeof value === 'string' ? value : null}
          onOpen={(url) => setGalleryIndex(photoIndexOf(url))}
        />
      );
    }

    return undefined;
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col p-6 md:p-8"
    >
      {/* Cabecera flotante */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] px-6 py-6 md:px-8 md:py-8 flex-shrink-0 mb-6 border-0"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center">
              <HiOutlineDocumentReport className="w-6 h-6 mr-3 text-primary-gold" />
              {payload.title}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {payload.subtitle ? `${payload.subtitle} · ` : ''}
              {payload.rows.length} resultado{payload.rows.length !== 1 ? 's' : ''} · Generado el {generatedAt}
            </p>
          </div>

          {photos.length > 0 && photoSets.length === 0 && (
            <button
              type="button"
              onClick={() => setGalleryIndex(0)}
              className="flex items-center gap-2 px-6 py-2.5 bg-white text-primary-gold border border-primary-gold/30 rounded-full hover:bg-primary-gold/5 transition-all active:scale-95 text-xs font-bold shrink-0"
            >
              <FiImage className="w-4 h-4" />
              Ver galería ({photos.length})
            </button>
          )}
        </div>
      </motion.div>

      {/* Resultado */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-4 md:p-6"
      >
        <ReportResultTable
          headers={payload.headers}
          rows={payload.rows}
          footer={payload.footer}
          renderCell={renderCell}
        />
      </motion.div>

      <PhotoGalleryViewer
        photos={photos}
        index={galleryIndex}
        onIndexChange={setGalleryIndex}
        onClose={() => setGalleryIndex(null)}
      />
    </motion.div>
  );
};

export default ChecklistReportResultView;
