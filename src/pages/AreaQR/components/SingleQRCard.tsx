// components/SingleQRCard.tsx
// Etiqueta imprimible de un área. Reproduce el formato oficial: logo arriba, QR
// grande, y debajo el nombre del área en negrita seguido de Código, Sede y Nivel.
// Se imprime una etiqueta por hoja (ver reglas @media print de AreaQRView).

import React, { useMemo, useState, useEffect } from 'react';
import qrcode from 'qrcode-generator';
import PristineLogo from './PristineLogo';
import { AreaItemData } from './AreaItemCard';
import { formatAreaCode } from '../utils/areaCode';

const QR_CELL_SIZE = 6;
const QR_MARGIN = 2;

interface SingleQRCardProps {
  item: AreaItemData;
  id?: string;
  /** Ancho de la etiqueta en px; se amplía al imprimir. */
  width?: number;
}

export const SingleQRCard: React.FC<SingleQRCardProps> = ({ item, id, width = 320 }) => {
  const codeStr = formatAreaCode(item.area_id);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [item.sedePhoto]);

  const svgString = useMemo(() => {
    const build = (typeNumber: 0 | 4) => {
      const qr = qrcode(typeNumber, 'H');
      qr.addData(codeStr);
      qr.make();
      return qr.createSvgTag(QR_CELL_SIZE, QR_MARGIN);
    };

    try {
      return build(0);
    } catch {
      return build(4);
    }
  }, [codeStr]);

  const hasPhoto = Boolean(item.sedePhoto && !imageError);
  const isDataUrl = item.sedePhoto ? item.sedePhoto.startsWith('data:') : false;

  return (
    <div
      id={id}
      className="qr-print-label bg-white flex flex-col items-center text-center mx-auto"
      style={{ width, backgroundColor: '#ffffff', padding: '24px 20px' }}
    >
      <div style={{ width: width * 0.72, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {hasPhoto ? (
          <img
            src={item.sedePhoto!}
            alt={item.sedeName || 'Logo Sede'}
            className="qr-print-logo max-h-16 w-auto object-contain mx-auto"
            style={{ maxHeight: 64, maxWidth: '100%' }}
            crossOrigin={isDataUrl ? undefined : 'anonymous'}
            onError={() => setImageError(true)}
          />
        ) : (
          <PristineLogo className="qr-print-logo" />
        )}
      </div>

      <div
        className="qr-print-code flex items-center justify-center"
        style={{ width: width * 0.78, marginBottom: 24 }}
        dangerouslySetInnerHTML={{ __html: svgString }}
      />

      <h3 className="qr-print-title font-bold text-black leading-tight break-words" style={{ fontSize: 22 }}>
        {item.name}
      </h3>

      <p className="qr-print-line text-black" style={{ fontSize: 18, marginTop: 6 }}>
        Código: {codeStr}
      </p>
      <p className="qr-print-line text-black" style={{ fontSize: 18, marginTop: 2 }}>
        Sede: {item.sedeName || item.sectorName || '—'}
      </p>
      <p className="qr-print-line text-black" style={{ fontSize: 18, marginTop: 2 }}>
        Nivel: {item.level ?? 1}
      </p>
    </div>
  );
};

export default SingleQRCard;
