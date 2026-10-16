import React from 'react';
import { FiLoader, FiPrinter } from 'react-icons/fi';
import { printDocument } from './ppmPrintDocument';
import './ppmPrint.css';

const BUSY_LABEL = 'Generando PDF…';

interface PPMPrintButtonProps {
  label?: string;
  /** Nombre que ofrece el navegador al "Guardar como PDF" (ver ppmPrintDocument). */
  documentName?: string;
  /** Sustituye la impresión directa cuando antes hay que montar la ficha imprimible. */
  onPrint?: () => void;
  /** Bloquea el botón mientras se está generando el documento. */
  busy?: boolean;
  className?: string;
}

/**
 * Imprime la ficha visible (la marcada con .ppm-print-area). El navegador ofrece
 * "Guardar como PDF", así que sirve tanto para imprimir como para exportar
 * conservando el diseño de pantalla. Con `onPrint` la ficha la monta quien llama,
 * que es como se descarga el PDF directo (ver ppmPdfDocument).
 */
export const PPMPrintButton: React.FC<PPMPrintButtonProps> = ({
  label = 'Imprimir',
  documentName,
  onPrint,
  busy = false,
  className = ''
}) => (
  <button
    type="button"
    onClick={() => (onPrint ? onPrint() : printDocument(documentName))}
    disabled={busy}
    title="Imprimir o guardar como PDF"
    className={`ppm-no-print flex items-center justify-center gap-2 px-6 py-2.5 bg-primary-gold text-white rounded-full hover:opacity-90 transition-all shadow-[0_4px_12px_rgba(221,152,3,0.25)] font-bold text-sm active:scale-95 shrink-0 disabled:opacity-70 disabled:cursor-wait disabled:active:scale-100 ${className}`}
  >
    {busy ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiPrinter className="w-4 h-4" />}
    {busy ? BUSY_LABEL : label}
  </button>
);

export default PPMPrintButton;
