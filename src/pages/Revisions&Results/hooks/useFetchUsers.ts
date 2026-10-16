// hooks/useFetchUsers.ts
// Sin cambios estructurales — users no se migra.
// Mejoras: elimina console.log de producción, useRef sigue evitando doble fetch en StrictMode

import { useEffect, useState, useRef } from "react";
import { getEnabledUsersAdapter } from "../adapters/getEnabledUsersAdapter";
import { User } from "../../../models/User";

interface UseFetchUsersReturn {
  users: User[];
  loading: boolean;
  error: string | null;
}

const useFetchUsers = (): UseFetchUsersReturn => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    const fetch = async () => {
      try {
        const { users: data } = await getEnabledUsersAdapter({ pageSize: 100 });
        setUsers(data);
      } catch {
        setError("Could not load users.");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  return { users, loading, error };
};

export default useFetchUsers;
