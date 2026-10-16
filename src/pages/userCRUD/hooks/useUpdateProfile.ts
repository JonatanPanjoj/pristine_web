// src/pages/userCRUD/hooks/useUpdateProfile.ts
import { useState } from "react";
import { updateUserFields, updateProfilePhoto } from "../adapters/ProfileAdapter";
import { User } from "../../../models/User";

interface UseUpdateProfileReturn {
  loading: boolean;
  error: string | null;
  updateFields: (userId: string, fields: Partial<User>) => Promise<boolean>;
  updatePhoto: (userId: string, url: string) => Promise<boolean>;
}

export const useUpdateProfile = (): UseUpdateProfileReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateFields = async (
    userId: string,
    fields: Partial<User>
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await updateUserFields(userId, fields);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar los cambios.");
      return false;
    } finally {
      setLoading(false);
    } // cierra finally
  }; // cierra const updateFields

  const updatePhoto = async (userId: string, url: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await updateProfilePhoto(userId, url);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar la foto.");
      return false;
    } finally {
      setLoading(false);
    } // cierra finally
  }; // cierra const updatePhoto

  return { loading, error, updateFields, updatePhoto };
}; // cierra export const useUpdateProfile
