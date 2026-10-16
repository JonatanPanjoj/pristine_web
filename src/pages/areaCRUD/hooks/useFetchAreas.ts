import { useState, useEffect } from 'react';
import { getAllAreasAdapter } from '../adapters/getAllAreasAdapter'; // Asegúrate de que la ruta sea correcta
import { Area } from '../../../models/Area'; // Asegúrate de que la ruta sea correcta
import { QueryDocumentSnapshot } from 'firebase/firestore';

interface UseFetchAreasOptions {
  searchFields?: Partial<Omit<Area, 'id'>>; // Campos de búsqueda opcionales
  pageSize?: number; // Tamaño de página
  orderByField?: keyof Area; // Campo para ordenar
  orderDirection?: 'asc' | 'desc'; // Dirección de ordenamiento
  sectorIds?: string[]; // Array de SectorId para filtrar
}

const useFetchAreas = (options: UseFetchAreasOptions = {}) => {
  const [areas, setAreas] = useState<Area[]>([]); // Estado para las áreas
  const [loading, setLoading] = useState<boolean>(true); // Estado de carga
  const [error, setError] = useState<string | null>(null); // Estado de error
  const [totalDocs, setTotalDocs] = useState<number>(0); // Estado para el total de documentos
  const [totalPages, setTotalPages] = useState<number>(0); // Estado para el total de páginas
  const [currentPage, setCurrentPage] = useState<number>(1); // Estado para la página actual
  const [lastVisible, setLastVisible] = useState<any>(null); // Último documento visible para avanzar
  const [firstVisible, setFirstVisible] = useState<any>(null); // Primer documento visible para retroceder
  const [previousPages, setPreviousPages] = useState<any[]>([]); // Pila de páginas anteriores

  // Función para obtener áreas de una página específica, incluyendo búsqueda
  const fetchAreas = async (pageIndex: number, startAfterDoc: any = null, isNext = true) => {
    setLoading(true);
    setError(null);

    try {
      // Pasar los términos de búsqueda al adaptador
      const { areas: newAreas, lastVisible: newLastVisible, firstVisible: newFirstVisible, totalDocs, totalPages } = await getAllAreasAdapter({
        ...options,
        pageIndex,
        pageSize: options.pageSize || 10, // Tamaño de página por defecto
        startAfterDoc,
        searchFields: options.searchFields || {}, // Pasar los términos de búsqueda
        sectorIds: options.sectorIds || [] // Pasar los sectorIds
      });

      // Actualizar el estado de las áreas y la paginación
      setCurrentPage(pageIndex);
      setAreas(newAreas);
      setLastVisible(newLastVisible); // Último documento visible de esta página
      setFirstVisible(newFirstVisible); // Primer documento visible de esta página
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
      fetchAreas(currentPage + 1, lastVisible, true); // Ir a la siguiente página
    }
  };

  // Función para retroceder a la página anterior
  const prevPage = () => {
    if (!loading && currentPage > 1) {
      const previousPageDoc = previousPages[previousPages.length - 2] || null; // Obtener el documento de la página anterior
      setPreviousPages((prev) => prev.slice(0, -1)); // Eliminar la página actual de la pila
      fetchAreas(currentPage - 1, previousPageDoc, false); // Ir a la página anterior
    }
  };

  // Función para cargar una página específica
  const loadPage = (pageIndex: number) => {
    if (!loading && pageIndex !== currentPage) {
      if (pageIndex > currentPage) {
        // Si la nueva página es mayor, avanzar
        fetchAreas(pageIndex, lastVisible, true); 
      } else if (pageIndex < currentPage) {
        // Si la nueva página es menor, retroceder
        const previousPageDoc = previousPages[previousPages.length - (currentPage - pageIndex + 1)] || null;
        setPreviousPages((prev) => prev.slice(0, -(currentPage - pageIndex)));
        fetchAreas(pageIndex, previousPageDoc, false);
      }
    }
  };

  // Llamar a la primera página al montar el componente
  useEffect(() => {
    fetchAreas(1);
  }, [options.searchFields, options.sectorIds]); // Volver a cargar cuando cambian los términos de búsqueda o los sectorIds

  return {
    areas,
    loading,
    error,
    totalDocs,
    totalPages,
    currentPage,
    nextPage,
    prevPage,
    loadPage,
  };
};

export default useFetchAreas;
