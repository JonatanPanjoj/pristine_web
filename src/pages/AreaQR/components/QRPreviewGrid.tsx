import React, { useMemo } from 'react';
import qrcode from 'qrcode-generator';
import { AreaItemData } from './AreaItemCard';
import { FiEye } from 'react-icons/fi';
import { formatAreaCode } from '../utils/areaCode';

interface QRPreviewGridProps {
  selectedItems: AreaItemData[];
}

const QRPreviewCard: React.FC<{ item: AreaItemData }> = ({ item }) => {
  const codeStr = formatAreaCode(item.area_id);

  const svgString = useMemo(() => {
    try {
      const qr = qrcode(0, 'H');
      qr.addData(codeStr);
      qr.make();
      return qr.createSvgTag(4, 1);
    } catch {
      const qr = qrcode(4, 'H');
      qr.addData(codeStr);
      qr.make();
      return qr.createSvgTag(4, 1);
    }
  }, [codeStr]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 pb-5 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
      {/* Logo de Sede si existe */}
      {item.sedePhoto && (
        <div className="w-full flex items-center justify-center mb-2 h-7">
          <img
            src={item.sedePhoto}
            alt={item.sedeName || 'Logo Sede'}
            className="max-h-7 w-auto object-contain mx-auto"
            crossOrigin={item.sedePhoto.startsWith('data:') ? undefined : 'anonymous'}
          />
        </div>
      )}

      {/* SVG del QR */}
      <div
        className="w-28 h-28 flex items-center justify-center mb-2"
        dangerouslySetInnerHTML={{ __html: svgString }}
      />

      {/* Info de la Ubicación sin recortado */}
      <div className="w-full px-1 text-center mt-2 mb-1 flex flex-col items-center">
        <h4 className="text-xs font-bold text-slate-900 leading-normal break-words max-w-[150px] pb-1">
          {item.name}
        </h4>
        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
          Código: {codeStr}
        </p>
        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
          Sede: {item.sedeName || '—'}
        </p>
        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
          Sector: {item.sectorName || 'Pristine'}
        </p>
        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
          Nivel: {item.level || '1'}
        </p>
      </div>
    </div>
  );
};

export const QRPreviewGrid: React.FC<QRPreviewGridProps> = ({ selectedItems }) => {
  if (selectedItems.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-16 text-center text-slate-400">
        <FiEye className="w-10 h-10 mb-3 text-slate-300 animate-pulse" />
        <p className="text-sm font-semibold text-slate-600">Sin sedes seleccionadas</p>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Selecciona una o más sedes en el panel izquierdo para generar su vista previa de código QR.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[560px] overflow-y-auto pr-1 scrollbar-none">
      {selectedItems.map((item) => (
        <QRPreviewCard key={item.id} item={item} />
      ))}
    </div>
  );
};

export default QRPreviewGrid;
