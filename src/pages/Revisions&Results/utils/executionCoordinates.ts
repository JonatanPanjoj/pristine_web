// utils/executionCoordinates.ts
// Coordenadas del punto donde se ejecutó la revisión.
//
// La aplicación móvil todavía no envía el GPS del técnico, así que la ficha
// muestra un punto fijo definido aquí para la demostración. Cuando la app
// empiece a mandar el GPS real, este módulo es el único punto a tocar: se lee el
// campo del documento y se apaga SIMULATE_COORDINATES.

import { ChecklistRevision } from '../../../models/ChecklistRevision';

const SIMULATE_COORDINATES = true;

/** Punto fijo de la demostración. */
const DEMO_COORDINATES: ExecutionCoordinates = {
  latitude: 14.583509607524242,
  longitude: -90.48743134686367,
};

export interface ExecutionCoordinates {
  latitude: number;
  longitude: number;
}

/** Punto de la ejecución obtenido del GPS real de la revisión. */
export const resolveExecutionCoordinates = (revision: ChecklistRevision): ExecutionCoordinates | null => {
  const loc = revision.endLocation || revision.startLocation || revision.end_location || revision.start_location;
  if (loc && typeof loc.latitude === 'number' && typeof loc.longitude === 'number' && loc.latitude !== 0 && loc.longitude !== 0) {
    return {
      latitude: loc.latitude,
      longitude: loc.longitude,
    };
  }
  return null;
};
