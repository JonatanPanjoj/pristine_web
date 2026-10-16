// components/BoardsSectionHeading.tsx
// Rótulo que agrupa un bloque de tableros. Va suelto sobre la rejilla, no dentro
// de una tarjeta: la jerarquía la da el rótulo, y las tarjetas siguen flotando.

import React from 'react';

interface BoardsSectionHeadingProps {
  title: string;
  /** Frase corta que dice qué mira este bloque. */
  hint?: string;
}

export const BoardsSectionHeading: React.FC<BoardsSectionHeadingProps> = ({ title, hint }) => (
  <div className="flex items-center gap-3 mb-4 px-1">
    <span className="w-1.5 h-6 rounded-full bg-primary-gold shrink-0" />
    <div className="min-w-0">
      <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800">{title}</h2>
      {hint && <p className="text-xs text-slate-500 mt-0.5">{hint}</p>}
    </div>
  </div>
);

export default BoardsSectionHeading;
