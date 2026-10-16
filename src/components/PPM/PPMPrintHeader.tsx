// components/PPM/PPMPrintHeader.tsx
// Membrete de las fichas PPM: cuándo se generó el documento, quién lo generó y
// la marca. Va marcado con .ppm-print-header porque el PDF lo trata aparte —lo
// recorta del lienzo y lo estampa en la cabecera de todas las hojas (ver
// ppmPdfDocument)—, así que no debe llevar la clase de bloque paginable.

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import logo from '../../assets/img/logo.png';
import './ppmPrint.css';

interface PPMPrintHeaderProps {
  /** Momento que se estampa en el papel. Por defecto, el de la generación. */
  printedAt?: Date;
}

export const PPMPrintHeader: React.FC<PPMPrintHeaderProps> = ({ printedAt = new Date() }) => {
  const printedBy = useSelector((state: RootState) => state.user.user?.name);

  return (
    <div className="ppm-print-header flex items-start justify-between gap-6 mb-6">
      <div className="text-xs text-slate-700 leading-relaxed">
        <p>
          <span className="font-bold">Fecha/Hora de impresión:</span> {formatPrintStamp(printedAt)}
        </p>
        <p>
          <span className="font-bold">Impreso por:</span> {printedBy || '—'}
        </p>
      </div>

      {/* Un logo desmesurado se decodifica entero aunque se pinte a 56 px: si se
          cambia el archivo, conviene que venga ya a tamaño razonable. */}
      <img src={logo} alt="Logo de la empresa" className="h-14 w-auto shrink-0" />
    </div>
  );
};

/** `15/08/2026 04:57`, en 24 horas y con día y mes de dos cifras. */
const formatPrintStamp = (when: Date): string => {
  const pad = (value: number): string => String(value).padStart(2, '0');
  const day = `${pad(when.getDate())}/${pad(when.getMonth() + 1)}/${when.getFullYear()}`;

  return `${day} ${pad(when.getHours())}:${pad(when.getMinutes())}`;
};

export default PPMPrintHeader;
