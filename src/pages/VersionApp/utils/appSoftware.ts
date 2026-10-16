// Las aplicaciones para las que se publica una versión.
//
// Antes era texto libre y cada quien lo escribía a su manera —"ppm", "PPM",
// "Ppm app"—, así que la app móvil no podía preguntar por su propia versión sin
// adivinar. Aquí quedan los nombres que valen.

export const SOFTWARE_OPTIONS = ['Checklist', 'HelpDesk', 'PPM', 'Auditoría'];

/**
 * Las opciones a mostrar incluyendo lo ya guardado.
 *
 * Los registros anteriores traen nombres que no están en la lista; si el
 * desplegable no los ofreciera, abrir a editar cambiaría el software sin que
 * nadie lo pidiera.
 */
export const softwareOptionsFor = (current?: string): string[] =>
  current && !SOFTWARE_OPTIONS.includes(current)
    ? [...SOFTWARE_OPTIONS, current]
    : SOFTWARE_OPTIONS;
