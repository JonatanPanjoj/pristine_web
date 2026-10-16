import { useEffect, useState, useRef } from 'react';
import { User } from '../../../models/User';
import { Role } from '../../../models/Role';
import { QueryDocumentSnapshot } from 'firebase/firestore';
import { getAllUsers } from '../adapters/UserAdapter';
import { getAllRoles } from '../adapters/RoleAdapter';

interface UseUserDataOptions {
  pageSize?: number;
  orderByField?: keyof User;
  orderDirection?: 'asc' | 'desc';
  searchFields?: Partial<Omit<User, 'id' | 'created_at'>>;
} // cierra interface UseUserDataOptions

export const useUserData = (options: UseUserDataOptions = {}) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPageData, setCurrentPageData] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [cursors, setCursors] = useState<(any | null)[]>([null]);
  const [hasMore, setHasMore] = useState(false);
  
  const totalLecturasAcumuladas = useRef(0);

  const fetchUsers = async (pageIndex: number) => {
    setLoading(true);
    setError(null);

    try {
      // Si estamos buscando desde cero, limpiamos los cursores
      const currentCursors = pageIndex === 1 ? [null] : cursors;
      if (pageIndex === 1) {
        setCursors([null]);
      } // cierra if (pageIndex === 1)

      const cursor = currentCursors[pageIndex - 1] || null;

      const result = await getAllUsers({
        ...options,
        pageSize: options.pageSize || 10,
        startAfterDoc: cursor,
        searchFields: options.searchFields || {},
      });

      const lecturasEnEstaPagina = result.users.length + (result.hasMore ? 1 : 0);
      totalLecturasAcumuladas.current += lecturasEnEstaPagina;

      console.log(
        `%c[Rendimiento] Total acumulado de lecturas en esta sesión: ${totalLecturasAcumuladas.current}`,
        "color: #00bcd4; font-weight: bold;"
      );

      setCurrentPage(pageIndex);
      setCurrentPageData(result.users);
      setHasMore(result.hasMore);

      if (result.lastVisible) {
        setCursors(prev => {
          const nextCursors = [...prev];
          nextCursors[pageIndex] = result.lastVisible;
          return nextCursors;
        }); // cierra setCursors
      } // cierra if (result.lastVisible)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    } // cierra finally
  }; // cierra const fetchUsers

  const loadPage = (pageIndex: number) => {
    if (!loading) {
      fetchUsers(pageIndex);
    } // cierra if (!loading)
  }; // cierra const loadPage

  const fetchRoles = async () => {
    try {
      const rolesData = await getAllRoles();
      setRoles(rolesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar roles.');
    } // cierra catch (err)
  }; // cierra const fetchRoles

  // Cargar roles y la primera página de usuarios al iniciar o cambiar filtros/tamaño
  useEffect(() => {
    fetchRoles();
    fetchUsers(1);
  }, [options.pageSize, options.searchFields]); // cierra useEffect

  const getRoleNameById = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : 'Desconocido';
  }; // cierra const getRoleNameById

  const getRoleIdByName = (roleName: string) => {
    if (!roleName) {
        return '';
    } // cierra if (!roleName)
    const role = roles.find(r => r.name?.toLowerCase() === roleName.toLowerCase());
    return role ? role.id : roleName;
  }; // cierra const getRoleIdByName

  const refetch = () => {
    fetchUsers(currentPage);
  };

  return {
    currentPageData,
    loading,
    error,
    loadPage,
    refetch,
    currentPage,
    hasMore,
    getRoleNameById,
    setCurrentPageData,
    getRoleIdByName,
  }; // cierra return
}; // cierra export const useUserData