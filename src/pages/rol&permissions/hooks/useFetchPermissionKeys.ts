// src/hooks/useFetchPermissionKeys.ts
import { useState } from 'react';
import { fetchPermissionKeysByIds } from '../adapters/PermissionIdToKeyAdapter'; // Usamos el nuevo nombre del adapter

export const useFetchPermissionKeys = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionKeys, setPermissionKeys] = useState<string[]>([]);

  const fetchPermissionKeys = async (permissionIds: string[]) => {
    setLoading(true);
    setError(null);

    try {
      const keys = await fetchPermissionKeysByIds(permissionIds);
      setPermissionKeys(keys); // Guardamos las keys en el estado
    } catch (err: any) {
      setError(err.message || 'Error desconocido al obtener las keys.');
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchPermissionKeys,
    permissionKeys,
    loading,
    error,
  };
};
