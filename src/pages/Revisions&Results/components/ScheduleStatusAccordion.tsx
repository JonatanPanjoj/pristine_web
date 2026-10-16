// components/ScheduleStatusAccordion.tsx
// Grupo plegable de programaciones por estado de ejecución. Muestra el código de
// programación y el QR del área, y enlaza a la revisión cuando ya existe.

import React, { useState, useEffect } from 'react';
import { FiChevronRight, FiEye } from 'react-icons/fi';
import { IconType } from 'react-icons';
import { ScheduleOccurrence } from '../adapters/getSchedulesByRangeAdapter';
import { formatAreaCode } from '../../AreaQR/utils/areaCode';

/** Cuánto dura el resalte de una fila que acaba de cambiar en vivo. */
const RESALTE_MS = 2600;

/**
 * El resalte se hace con CSS y no con framer-motion.
 *
 * Animar `<tr>` con `layout` es frágil: el navegador no aplica `transform` a las
 * filas de una tabla de forma fiable. Y el "viaje" de un grupo a otro tampoco
 * podía ocurrir, porque cada estado es un acordeón distinto y framer-motion no
 * anima entre árboles separados. Una animación CSS hace lo mismo, no puede
 * fallar, y no cuesta nada.
 */
const RESALTE_CSS = `
@keyframes filaActualizada {
  0%   { background-color: rgba(252, 181, 33, 0.22); }
  100% { background-color: transparent; }
}
.fila-actualizada > td { animation: filaActualizada ${RESALTE_MS}ms ease-out; }
`;

/** Si la fila cambió hace un momento, para resaltarla sin que se quede así. */
const recienCambiada = (updatedAt?: number): boolean =>
  Boolean(updatedAt) && Date.now() - (updatedAt as number) < RESALTE_MS;

const ESTILO_ID = 'ssa-resalte';

/** Mete la animación en el documento una sola vez, la use quien la use. */
const useInyectarResalte = () => {
  useEffect(() => {
    if (document.getElementById(ESTILO_ID)) return;

    const estilo = document.createElement('style');
    estilo.id = ESTILO_ID;
    estilo.textContent = RESALTE_CSS;
    document.head.appendChild(estilo);
  }, []);
};

export interface StatusMeta {
  label: string;
  softBg: string;
  softText: string;
  Icon: IconType;
}

interface ScheduleStatusAccordionProps {
  meta: StatusMeta;
  rows: ScheduleOccurrence[];
  showDate: boolean;
  defaultOpen?: boolean;
  onOpenRevision: (revisionId: string) => void;
}

const TH = 'bg-primary-gold text-white font-bold text-[10px] uppercase tracking-wider py-2 px-4 whitespace-nowrap';
const CELL = 'bg-[#FAFAFA] py-2 px-4 text-[13px] whitespace-nowrap group-hover:bg-white transition-colors';

export const ScheduleStatusAccordion: React.FC<ScheduleStatusAccordionProps> = ({
  meta,
  rows,
  showDate,
  defaultOpen,
  onOpenRevision,
}) => {
  const [open, setOpen] = useState(!!defaultOpen);
  const Icon = meta.Icon;

  useInyectarResalte();

  const headers = [
    ...(showDate ? ['Fecha'] : []),
    'Código de programación',
    'QR',
    'Checklist',
    'Sector',
    'Área',
    'Categoría',
    'Horario',
    'Revisión',
  ];

  return (
    <div className="bg-white rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] border-0 overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center gap-3 px-5 py-3.5 text-left">
        <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${meta.softBg} ${meta.softText}`}>
          <Icon className="w-[17px] h-[17px]" />
        </span>
        <span className="text-[15px] font-bold flex-1 text-slate-800">{meta.label}s</span>
        <span className={`inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full text-[12px] font-bold tabular-nums ${meta.softBg} ${meta.softText}`}>
          {rows.length}
        </span>
        <FiChevronRight
          className="w-[18px] h-[18px] text-slate-400 transition-transform"
          style={{ transform: open ? 'rotate(90deg)' : 'none' }}
        />
      </button>

      {open && (
        <div className="border-t border-slate-100 px-4 pt-2 pb-4">
          {rows.length ? (
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-y-2 border-spacing-x-0 text-left">
                <thead>
                  <tr>
                    {headers.map((header, index) => (
                      <th
                        key={header}
                        className={`${TH} ${index === 0 ? 'rounded-l-full' : ''} ${index === headers.length - 1 ? 'rounded-r-full' : ''}`}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.occurrenceId}
                      className={`group${recienCambiada(row.updatedAt) ? ' fila-actualizada' : ''}`}
                    >
                      {showDate && (
                        <td className={`${CELL} rounded-l-full font-mono text-[12px] text-slate-500`}>{row.date}</td>
                      )}
                      <td className={`${CELL} ${showDate ? '' : 'rounded-l-full'} font-mono text-[11px] text-slate-500`} title={row.scheduleId}>
                        {row.scheduleId}
                      </td>
                      <td className={CELL}>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono bg-primary-gold/15 text-primary-gold border border-primary-gold/30 tabular-nums">
                          {formatAreaCode(row.areaId)}
                        </span>
                      </td>
                      <td className={`${CELL} font-medium text-slate-800`}>{row.checklistName}</td>
                      <td className={`${CELL} text-slate-600`}>{row.sectorName}</td>
                      <td className={`${CELL} text-slate-600`}>{row.areaName}</td>
                      <td className={CELL}>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-action-200/40 text-action-700 border border-action-200">
                          {row.categoryName}
                        </span>
                      </td>
                      <td className={`${CELL} font-mono text-[12px] tabular-nums text-slate-500`}>
                        {row.startTime}–{row.endTime}
                      </td>
                      <td className={`${CELL} rounded-r-full`}>
                        {row.revisionId ? (
                          <button
                            onClick={() => onOpenRevision(row.revisionId as string)}
                            title="Ver detalle de la revisión"
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-dark text-white text-[11px] font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm"
                          >
                            <FiEye className="w-3 h-3" /> Ver más
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Sin revisión</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="px-1 py-6 text-[13px] text-center text-slate-400">
              Sin registros {meta.label.toLowerCase()}s en este periodo.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ScheduleStatusAccordion;
