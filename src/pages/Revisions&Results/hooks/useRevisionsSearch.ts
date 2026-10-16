// hooks/useRevisionsSearch.ts
// Reemplaza: useRevisionsWithSearch
// Nota:      getRevisionsSearchAdapter se genera en P3.
//            Este hook está preparado para recibirlo — misma firma de estado.
//            Cambios en los tipos vendrán cuando el adapter de P3 esté listo.

import { useState, useCallback } from "react";
import {
  getRevisionsSearchAdapter,
  RevisionsSearchParams,
  RevisionsSearchColumns,
  RevisionSearchResult,
} from "../adapters/getRevisionsSearchAdapter";

interface UseRevisionsSearchReturn {
  data: RevisionSearchResult[] | null;
  loading: boolean;
  error: string | null;
  fetchRevisions: (
    params: RevisionsSearchParams,
    columns: RevisionsSearchColumns
  ) => Promise<RevisionSearchResult[]>;
}

export const useRevisionsSearch = (): UseRevisionsSearchReturn => {
  const [data, setData] = useState<RevisionSearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRevisions = useCallback(
    async (params: RevisionsSearchParams, columns: RevisionsSearchColumns) => {
      setLoading(true);
      setError(null);
      try {
        const result = await getRevisionsSearchAdapter(params, columns);
        setData(result);
        return result;
      } catch (err) {
        setError((err as Error).message || "Could not load revisions.");
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { data, loading, error, fetchRevisions };
};
