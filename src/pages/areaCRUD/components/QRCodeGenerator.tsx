import React from 'react';
import { QRCodeCanvas } from 'qrcode.react'; // Asegúrate de importar correctamente QRCodeCanvas

interface QRCodeGeneratorProps {
  text: string;
  sedePhoto?: string | null;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ text, sedePhoto }) => {
  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      {sedePhoto && (
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
          <img
            src={sedePhoto}
            alt="Logo Sede"
            className="max-h-16 w-auto object-contain mx-auto"
            style={{ maxHeight: 60 }}
            crossOrigin="anonymous"
          />
        </div>
      )}
      <h3 className="font-bold text-slate-800 mb-3">Generador de Código QR</h3>
      <QRCodeCanvas
        value={text}
        size={200}
        level="H"
        includeMargin={true}
      />
      <p className="mt-2 text-xs text-slate-500 font-mono">{text}</p>
    </div>
  );
};

export default QRCodeGenerator;
