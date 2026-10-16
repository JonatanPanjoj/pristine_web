// src/pages/userCRUD/hooks/useFetchRoles.ts
import { useEffect, useState, useRef } from 'react';
import { getAllRoles } from '../adapters/RoleAdapter'; // Ruta correcta
import { Role } from '../../../models/Role'; // Ruta correcta

const useFetchRoles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const didFetchRoles = useRef(false);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        console.log("cargado");
        const rolesData = await getAllRoles();

        // Filtrar roles activos (is_enabled o status)
        const enabledRoles = rolesData.filter((role: any) => role.is_enabled !== false && role.status !== false);

        setRoles(enabledRoles);
        didFetchRoles.current = true; // Marcar como hecho
        setLoading(false); // Cambiar el estado de carga
      } catch (error) {
        setError("Error al obtener roles");
        setLoading(false);
      }
    };

    if (!didFetchRoles.current) {
      fetchRoles();
    }
  }, []);

  return { roles, loading, error };
};

export default useFetchRoles;
