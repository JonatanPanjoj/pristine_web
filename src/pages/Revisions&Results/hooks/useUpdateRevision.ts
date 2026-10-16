// hooks/useUpdateRevision.ts
// Reemplaza: useUpdateRevision (antiguo)
// Cambios:   recibe UpdateRevisionPayload en vez de (formData, responses, photoData) separados
//            ya no necesita RevisionResponse ni PhotoData de los modelos antiguos

import { useState } from "react";
import {
  updateRevisionAdapter,
  UpdateRevisionPayload,
} from "../adapters/updateRevisionAdapter";

interface UseUpdateRevisionReturn {
  updateRevision: (payload: UpdateRevisionPayload) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const useUpdateRevision = (): UseUpdateRevisionReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateRevision = async (payload: UpdateRevisionPayload): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await updateRevisionAdapter(payload);
    } catch (err) {
      const msg = (err as Error).message || "Could not update revision.";
      console.error(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return { updateRevision, loading, error };
};
