import React, { useMemo, useRef } from 'react';
import qrcode from 'qrcode-generator';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { FiDownload } from 'react-icons/fi';
import { BsFilePdf } from 'react-icons/bs';
import PristineLogo from './PristineLogo';

interface QRCodeGeneratorProps {
  text: string;
}

// ── Extrae el código numérico del texto (ej. "0205") ──────────────────────────
const extractCode = (text: string): string => {
  const match = text.match(/Código:\s*(.*?)\s*(?:Sede:|Sector:|Nivel:|$)/i);
  return match && match[1] ? match[1].trim() : '0000';
};

// ── Genera el SVG del QR con qrcode-generator (equivalente a phpqrcode) ───────
// PHP:  QRcode::png($codigo, $filename, "H", 5, 2)
//   → errorCorrectionLevel = "H"
//   → matrixPointSize      = 5   →  createSvgTag(cellSize=5, margin=2)
//   → margin               = 2
//   → value                = $codigo  (solo el código numérico)
const QRPhpStyle: React.FC<{ code: string }> = ({ code }) => {
  const svgString = useMemo(() => {
    // Validación equivalente a: if(trim($codigo) == '') die(...)
    if (!code.trim()) return '';

    try {
      // Tipo 0 = auto-detectar versión mínima según el contenido
      const qr = qrcode(0, 'H');   // errorCorrectionLevel = "H"
      qr.addData(code);            // value = $codigo (solo el código)
      qr.make();
      // cellSize=5 → matrixPointSize=5 | margin=2 → margin=2
      return qr.createSvgTag(5, 2);
    } catch {
      // Fallback: forzar tipo 4 si auto falla
      const qr = qrcode(4, 'H');
      qr.addData(code);
      qr.make();
      return qr.createSvgTag(5, 2);
    }
  }, [code]);

  if (!svgString) return (
    <div className="w-[200px] h-[200px] flex items-center justify-center text-xs text-red-400">
      Código inválido
    </div>
  );

  return (
    <div
      style={{ width: 200, height: 200 }}
      dangerouslySetInnerHTML={{ __html: svgString }}
    />
  );
};

// ── Formatea el texto debajo del QR ──────────────────────────────────────────
const formatText = (text: string) => {
  const lines = text.split('\n').filter(Boolean);
  return lines.map((line, index) => (
    <div
      key={index}
      style={{
        textAlign: 'center',
        fontWeight: index === 0 ? 'bold' : 'normal',
        fontSize: index === 0 ? 15 : 13,
        color: index === 0 ? '#111827' : '#374151',
        marginBottom: index === 0 ? 4 : 2,
        lineHeight: 1.5,
      }}
    >
      {line}
    </div>
  ));
};

// ── Componente principal ──────────────────────────────────────────────────────
const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ text }) => {
  const refToPrint = useRef<HTMLDivElement>(null);
  const code = useMemo(() => extractCode(text), [text]);

  const handlePrintImage = async () => {
    if (!refToPrint.current) return;
    const canvas = await html2canvas(refToPrint.current, { scale: 3, backgroundColor: '#ffffff' });
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `qrcode-${code}.png`;
    link.click();
  };

  const handlePrintPDF = async () => {
    if (!refToPrint.current) return;
    const canvas = await html2canvas(refToPrint.current, { scale: 3, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'letter' });
    const pageWidth  = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth   = canvas.width > pageWidth ? pageWidth - 40 : canvas.width;
    const imgHeight  = (imgWidth / canvas.width) * canvas.height;
    pdf.addImage(imgData, 'PNG', (pageWidth - imgWidth) / 2, (pageHeight - imgHeight) / 2, imgWidth, imgHeight);
    pdf.save(`qrcode-${code}.pdf`);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">
        Vista previa
      </p>

      {/* ── Tarjeta imprimible ── */}
      <div
        ref={refToPrint}
        className="flex flex-col items-center bg-white border border-gray-200 rounded-2xl shadow-sm"
        style={{ width: 300, padding: '28px 24px 24px' }}
      >
        {/* Logo Pristine */}
        <div style={{ width: 190, margin: '0 auto 20px', display: 'block' }}>
          <PristineLogo />
        </div>

        {/* QR generado con misma config que PHP:
            errorCorrectionLevel="H", matrixPointSize=5, margin=2
            value = código numérico (ej. "0205")                    */}
        <QRPhpStyle code={code} />

        {/* Texto descriptivo */}
        <div style={{ marginTop: 10, textAlign: 'center', whiteSpace: 'pre-wrap', fontFamily: 'sans-serif' }}>
          {formatText(text)}
        </div>
      </div>

      {/* ── Botones ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={handlePrintImage}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-sky-50 text-sky-600 border border-sky-100 hover:bg-sky-100 transition-all"
        >
          <FiDownload className="w-4 h-4" />
          Descargar PNG
        </button>
        <button
          onClick={handlePrintPDF}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 transition-all"
        >
          <BsFilePdf className="w-4 h-4" />
          Exportar PDF
        </button>
      </div>
    </div>
  );
};

export default QRCodeGenerator;