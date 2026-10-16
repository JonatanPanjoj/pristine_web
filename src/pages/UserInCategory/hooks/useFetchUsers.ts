// src/pages/userCRUD/hooks/useFetchUsers.ts
import { useEffect, useState, useRef } from 'react';
import { getEnabledUsersAdapter } from '../adapters/getEnabledUsersAdapter'; // Ruta correcta
import { User } from '../../../models/User'; // Ruta correcta

const useFetchUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const didFetchUsers = useRef(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log("Cargando usuarios...");
        const { users: usersData } = await getEnabledUsersAdapter({ pageSize: 100 }); // Cambia el pageSize según tus necesidades

        setUsers(usersData);
        didFetchUsers.current = true; // Marcar como hecho
        setLoading(false); // Cambiar el estado de carga
      } catch (error) {
        setError("Error al obtener usuarios");
        setLoading(false);
      }
    };

    if (!didFetchUsers.current) {
      fetchUsers();
    }
  }, []);

  return { users, loading, error };
};

export default useFetchUsers;
