// components/PPM/ppmReadOnlyStyles.ts
// Un registro ya cerrado se muestra con sus campos deshabilitados. El gris que
// el navegador les aplica —incluido el `-webkit-text-fill-color` de WebKit, que
// ignora `color`— deja el texto casi ilegible sobre el fondo claro, así que se
// fuerza el color de lectura (slate-800).
//
// La clase se escribe entera y literal: Tailwind rastrea el código fuente en
// busca de nombres de clase completos y no resolvería una plantilla armada.

/** Campos deshabilitados que aun así deben leerse (input, textarea, select). */
export const READ_ONLY_FIELD_CLASS =
  'disabled:opacity-100 disabled:text-slate-800 disabled:[-webkit-text-fill-color:#1e293b]';
