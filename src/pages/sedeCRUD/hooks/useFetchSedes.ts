import { useState, useEffect } from 'react';
import { getAllSedesAdapter } from '../adapters/getAllSedesAdaper';
import { Sede } from '../../../models/Sede';
import { QueryDocumentSnapshot } from 'firebase/firestore';
import { loadAndUpdateSedes } from '../../../services/sedeStorage';

interface UseFetchSedesOptions {
  searchFields?: Partial<Omit<Sede, 'id'>>;
  pageSize?: number;
  orderByField?: keyof Sede;
  orderDirection?: 'asc' | 'desc';
}

const useFetchSedes = (options: UseFetchSedesOptions = {}) => {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalDocs, setTotalDocs] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Cursores para paginación hacia adelante y hacia atrás
  const [cursors, setCursors] = useState<(any | null)[]>([null]);

  const fetchSedes = async (pageIndex: number) => {
    setLoading(true);
    setError(null);

    try {
      // Al volver a la página 1 (por búsqueda nueva o recarga), reseteamos cursores
      const currentCursors = pageIndex === 1 ? [null] : cursors;
      if (pageIndex === 1) {
        setCursors([null]);
      }

      const cursor = currentCursors[pageIndex - 1] || null;

      const result = await getAllSedesAdapter({
        ...options,
        pageSize: options.pageSize || 10,
        startAfterDoc: cursor,
        searchFields: options.searchFields || {},
        pageIndex,
      });

      setCurrentPage(pageIndex);
      setSedes(result.sedes);
      setTotalDocs(result.totalDocs);
      setTotalPages(result.totalPages);

      // Guardamos el cursor del final de esta página para poder avanzar
      if (result.lastVisible) {
        setCursors((prev) => {
          const next = [...prev];
          next[pageIndex] = result.lastVisible;
          return next;
        });
      }

      loadAndUpdateSedes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const loadPage = (pageIndex: number) => {
    if (!loading) {
      fetchSedes(pageIndex);
    }
  };

  // Recarga cuando cambian los campos de búsqueda (incluye limpieza del término)
  useEffect(() => {
    fetchSedes(1);
  }, [JSON.stringify(options.searchFields)]); // cierra useEffect

  return {
    sedes,
    loading,
    error,
    totalDocs,
    totalPages,
    currentPage,
    loadPage,
  };
};

export default useFetchSedes;
