// hooks/useRevisionsPeriod.ts
// Reemplaza: useRevisions
// Nota:      getRevisionsPeriodAdapter se genera en P3.
//            Los tipos están preparados para recibir ese adapter.

import { useState, useCallback } from "react";
import {
  getRevisionsPeriodAdapter,
  RevisionsPeriodParams,
  RevisionPeriodResult,
} from "../adapters/getRevisionsPeriodAdapter";

interface UseRevisionsPeriodReturn {
  data: RevisionPeriodResult[] | null;
  loading: boolean;
  error: string | null;
  fetchRevisions: (params: RevisionsPeriodParams) => Promise<RevisionPeriodResult[]>;
}

export const useRevisionsPeriod = (): UseRevisionsPeriodReturn => {
  const [data, setData] = useState<RevisionPeriodResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRevisions = useCallback(async (params: RevisionsPeriodParams) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getRevisionsPeriodAdapter(params);
      setData(result);
      return result;
    } catch (err) {
      setError("Could not load revision period data.");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchRevisions };
};
