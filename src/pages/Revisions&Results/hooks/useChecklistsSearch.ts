// hooks/useChecklistsSearch.ts
// Reemplaza: useListsWithSearch
// Nota:      getChecklistsSearchAdapter se genera en P3.

import { useState, useCallback } from "react";
import {
  getChecklistsSearchAdapter,
  ChecklistsSearchParams,
  ChecklistsSearchColumns,
  ChecklistSearchResult,
} from "../adapters/getChecklistsSearchAdapter";

interface UseChecklistsSearchReturn {
  data: ChecklistSearchResult[] | null;
  loading: boolean;
  error: string | null;
  fetchChecklists: (
    params: ChecklistsSearchParams,
    columns: ChecklistsSearchColumns
  ) => Promise<ChecklistSearchResult[]>;
}

export const useChecklistsSearch = (): UseChecklistsSearchReturn => {
  const [data, setData] = useState<ChecklistSearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChecklists = useCallback(
    async (params: ChecklistsSearchParams, columns: ChecklistsSearchColumns) => {
      setLoading(true);
      setError(null);
      try {
        const result = await getChecklistsSearchAdapter(params, columns);
        setData(result);
        return result;
      } catch (err) {
        setError((err as Error).message || "Could not load checklists.");
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { data, loading, error, fetchChecklists };
};
