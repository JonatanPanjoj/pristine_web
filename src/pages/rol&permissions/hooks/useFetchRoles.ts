import { useState, useEffect } from 'react';
import { getAllRolesAdapter } from '../adapters/getAllRolesAdapter'; // Asegúrate de que la ruta sea correcta
import { Role } from '../../../models/Role'; // Asegúrate de que la ruta sea correcta
import { QueryDocumentSnapshot } from 'firebase/firestore';

interface UseFetchRolesOptions {
  searchFields?: Partial<Omit<Role, 'id'>>; // Campos de búsqueda opcionales
  pageSize?: number; // Tamaño de página
  orderByField?: keyof Role; // Campo para ordenar
  orderDirection?: 'asc' | 'desc'; // Dirección de ordenamiento
}

const useFetchRoles = (options: UseFetchRolesOptions = {}) => {
  const [roles, setRoles] = useState<Role[]>([]); // Estado para los roles
  const [loading, setLoading] = useState<boolean>(true); // Estado de carga
  const [error, setError] = useState<string | null>(null); // Estado de error
  const [totalDocs, setTotalDocs] = useState<number>(0); // Estado para el total de documentos
  const [totalPages, setTotalPages] = useState<number>(0); // Estado para el total de páginas
  const [currentPage, setCurrentPage] = useState<number>(1); // Estado para la página actual
  const [lastVisible, setLastVisible] = useState<any>(null); // Último documento visible para avanzar
  const [firstVisible, setFirstVisible] = useState<any>(null); // Primer documento visible para retroceder
  const [previousPages, setPreviousPages] = useState<any[]>([]); // Pila de páginas anteriores

  // Función para obtener roles de una página específica
  const fetchRoles = async (pageIndex: number, startAfterDoc: any = null, isNext = true) => {
    setLoading(true);
    setError(null);

    try {
      const { roles: newRoles, lastVisible: newLastVisible, firstVisible: newFirstVisible, totalDocs, totalPages } = await getAllRolesAdapter({
        ...options,
        pageIndex,
        pageSize: options.pageSize || 10, // Tamaño de página por defecto
        startAfterDoc,
        searchFields: options.searchFields || {}
      });

      // Actualizar el estado de los roles y la paginación
      setCurrentPage(pageIndex);
      setRoles(newRoles);
      setLastVisible(newLastVisible); // Último documento visible
      setFirstVisible(newFirstVisible); // Primer documento visible
      setTotalDocs(totalDocs);
      setTotalPages(totalPages);

      // Guardar las referencias de páginas anteriores solo si estamos avanzando
      if (isNext && newFirstVisible) {
        setPreviousPages((prev) => [...prev, newFirstVisible]);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  // Función para avanzar a la siguiente página
  const nextPage = () => {
    if (!loading && currentPage < totalPages) {
      fetchRoles(currentPage + 1, lastVisible, true); // Ir a la siguiente página
    }
  };

  // Función para retroceder a la página anterior
  const prevPage = () => {
    if (!loading && currentPage > 1) {
      const previousPageDoc = previousPages[previousPages.length - 2] || null; // Obtener el documento de la página anterior
      setPreviousPages((prev) => prev.slice(0, -1)); // Eliminar la página actual de la pila
      fetchRoles(currentPage - 1, previousPageDoc, false); // Ir a la página anterior
    }
  };

  // Función para cargar una página específica
  const loadPage = (pageIndex: number) => {
    if (!loading && pageIndex !== currentPage) {
      if (pageIndex > currentPage) {
        // Si la nueva página es mayor, avanzar
        fetchRoles(pageIndex, lastVisible, true); 
      } else if (pageIndex < currentPage) {
        // Si la nueva página es menor, retroceder
        const previousPageDoc = previousPages[previousPages.length - (currentPage - pageIndex + 1)] || null;
        setPreviousPages((prev) => prev.slice(0, -(currentPage - pageIndex)));
        fetchRoles(pageIndex, previousPageDoc, false);
      }
    }
  };

  // Llamar a la primera página al montar el componente o cambiar filtros/tamaño
  useEffect(() => {
    fetchRoles(1);
  }, [options.searchFields, options.pageSize]); // Volver a cargar cuando cambian los términos de búsqueda o tamaño

  const refetch = () => {
    fetchRoles(currentPage, null, true);
  };

  return {
    roles,
    loading,
    error,
    totalDocs,
    totalPages,
    currentPage,
    nextPage,
    prevPage,
    loadPage,
    refetch,
  };
};

export default useFetchRoles;
