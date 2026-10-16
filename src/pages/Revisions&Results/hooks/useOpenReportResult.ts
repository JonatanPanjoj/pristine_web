// hooks/useOpenReportResult.ts
// Devuelve una función que abre el resultado de un reporte en una pestaña nueva.
// Abre la pestaña de forma SÍNCRONA en el click (para no perder el gesto de
// usuario y evitar el bloqueador de pop-ups) y luego, cuando la promesa del
// payload resuelve, guarda el resultado y navega la pestaña a la vista standalone.
// La URL se construye vía useMenuLinks para mantener la ruta en una sola fuente.

import { useCallback } from 'react';
import useMenuLinks from '../../../route/routerLink/useMenuLinks';
import { saveReportResult, ReportResultPayload } from '../utils/reportResult';

type OpenPayload = Omit<ReportResultPayload, 'createdAt'>;

/**
 * @param routeName - Ruta que renderiza el resultado. Cada módulo usa la suya
 * para que el permiso de la pestaña nueva sea el del módulo que la abre.
 */
export const useOpenReportResult = (routeName = 'checklistReportResult') => {
  const { getLinkByName } = useMenuLinks();

  return useCallback(async (payloadPromise: Promise<OpenPayload>) => {
    const win = window.open('', '_blank'); // síncrono → conserva el gesto de usuario
    try {
      const payload = await payloadPromise;
      const id = saveReportResult(payload);
      const url = getLinkByName(routeName).replace(':resultId', id);
      if (win) win.location.href = url;
      else window.open(url, '_blank', 'noopener'); // fallback si el pop-up fue bloqueado
    } catch {
      win?.close();
    }
  }, [getLinkByName, routeName]);
};
