// hooks/useGetRevisionById.ts
// Reemplaza: useGetRevisionById (antiguo)
// Sin cambios estructurales — sigue siendo una función pura sin estado propio.
// Cambio: retorna ChecklistRevision en vez de Revisions (modelo antiguo)

import { getRevisionByIdAdapter } from "../adapters/getRevisionByIdAdapter";
import { ChecklistRevision } from "../../../models/ChecklistRevision";

interface UseGetRevisionByIdReturn {
  getRevisionById: (revisionId: string) => Promise<ChecklistRevision | null>;
}

export const useGetRevisionById = (): UseGetRevisionByIdReturn => {
  const getRevisionById = async (
    revisionId: string
  ): Promise<ChecklistRevision | null> => {
    try {
      return await getRevisionByIdAdapter(revisionId);
    } catch (err) {
      console.error((err as Error).message || "Could not fetch revision.");
      return null;
    }
  };

  return { getRevisionById };
};
