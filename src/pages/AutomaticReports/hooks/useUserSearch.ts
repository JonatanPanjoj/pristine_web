// src/pages/AutomaticReports/hooks/useUserSearch.ts
import { useState, useEffect } from "react";
import { getAllUsers } from "../../userCRUD/adapters/UserAdapter";
import { User } from "../../../models/User";

const SEARCH_DEBOUNCE_MS = 350;
const SEARCH_PAGE_SIZE = 20;

// Busca usuarios por nombre contra los tokens de `search_keywords`. Sin término
// devuelve la primera página para que el selector nunca se vea vacío al abrirlo.
export const useUserSearch = (term: string) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const cleanTerm = term.trim().toLowerCase();
        const { users: found } = await getAllUsers({
          searchFields: cleanTerm ? { name: cleanTerm } : {},
          pageSize: SEARCH_PAGE_SIZE,
        });
        if (isActive) setUsers(found);
      } catch (err) {
        if (isActive) setError("Error al buscar usuarios.");
      } finally {
        if (isActive) setLoading(false);
      } // cierra finally
    }, SEARCH_DEBOUNCE_MS); // cierra setTimeout

    return () => {
      isActive = false;
      clearTimeout(timer);
    }; // cierra return
  }, [term]); // cierra useEffect

  return { users, loading, error };
}; // cierra export const useUserSearch
