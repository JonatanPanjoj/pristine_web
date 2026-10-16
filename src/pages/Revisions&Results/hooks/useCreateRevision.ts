// hooks/useCreateRevision.ts
// Reemplaza: useCreateRevision (antiguo)
// Cambios:   payload tipado con CreateRevisionPayload (camelCase)
//            ya no recibe Omit<Revisions, "id" | "status"> con campos snake_case

import { useState } from "react";
import {
  createRevisionAdapter,
  CreateRevisionPayload,
} from "../adapters/createRevisionAdapter";
import { ChecklistRevision } from "../../../models/ChecklistRevision";

interface UseCreateRevisionReturn {
  createRevision: (payload: CreateRevisionPayload) => Promise<ChecklistRevision>;
  loading: boolean;
  error: string | null;
}

export const useCreateRevision = (): UseCreateRevisionReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRevision = async (
    payload: CreateRevisionPayload
  ): Promise<ChecklistRevision> => {
    setLoading(true);
    setError(null);
    try {
      return await createRevisionAdapter(payload);
    } catch (err) {
      const msg = (err as Error).message || "Could not create revision.";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  return { createRevision, loading, error };
};
