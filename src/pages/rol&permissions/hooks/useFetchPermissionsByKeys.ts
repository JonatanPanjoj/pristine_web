import { useState } from "react";
import { fetchPermissionsByKeys } from "../adapters/PermissionAdapter"; // Ajusta la ruta

export const useFetchPermissionsByKeys = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionIds, setPermissionIds] = useState<string[]>([]);

  const fetchPermissions = async (keys: string[]) => {
    setLoading(true);
    setError(null); // Resetea el error al iniciar la llamada

    try {
      // Llama al adapter para obtener las permission IDs
      const ids = await fetchPermissionsByKeys(keys);
      setPermissionIds(ids); // Actualiza el estado con las IDs obtenidas
      console.log("Permisos traducidos correctamente", ids);
    } catch (err: any) {
      // Si ocurre un error, maneja el error
      setError(err.message || "Error desconocido al obtener permisos.");
    } finally {
      // Al finalizar la petición, desactiva el estado de carga
      setLoading(false);
    }
  };

  // Retorna el estado y la función para invocar la petición
  return {
    fetchPermissions,
    permissionIds,
    loading,
    error,
  };
};
