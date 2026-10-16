// src/hooks/useRolePermissions.ts
import { useEffect, useState } from 'react';
import { getRoleById, getPermissionsByIds } from '../adapters/RoleAdapter';

const useRolePermissions = (roleId: string) => {
  const [permissionsKeys, setPermissionsKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setLoading(true);
        const roleData = await getRoleById(roleId);
        
        if (roleData && roleData.permissions) {
          // roleData.permissions es el array de IDs de permisos
          const keys = await getPermissionsByIds(roleData.permissions);
          setPermissionsKeys(keys);
        } else {
          setPermissionsKeys([]);
        }

        setLoading(false);
      } catch (error) {
        setError("Error al obtener los permisos del rol.");
        setLoading(false);
      }
    };

    if (roleId) {
      fetchPermissions();
    }
  }, [roleId]);

  return { permissionsKeys, loading, error };
};

export default useRolePermissions;
