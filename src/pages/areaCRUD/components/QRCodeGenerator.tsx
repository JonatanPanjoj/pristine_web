import React from 'react';
import { QRCodeCanvas } from 'qrcode.react'; // Asegúrate de importar correctamente QRCodeCanvas

interface QRCodeGeneratorProps {
  text: string;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ text }) => {
  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h3>Generador de Código QR</h3>
      <QRCodeCanvas
        value={text}
        size={200} // Tamaño del QR
        level="H"  // Nivel de corrección de errores
        includeMargin={true} // Incluir margen alrededor del código QR
      />
      <p>{text}</p>
    </div>
  );
};

export default QRCodeGenerator;
