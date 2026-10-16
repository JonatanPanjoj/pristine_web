import { useState, useEffect } from 'react';
import { getAllSectorsAdapter } from '../adapters/getAllSectorsAdapter';
import { Sector } from '../../../models/Sector';
import { QueryDocumentSnapshot } from 'firebase/firestore';

interface UseFetchSectorsOptions {
  searchFields?: Partial<Omit<Sector, 'id'>>;
  pageSize?: number;
  orderByField?: keyof Sector;
  orderDirection?: 'asc' | 'desc';
  sedeIds?: string[]; // Cambiado a un array de `sedeIds`, pero mantenemos el nombre `sedeId`
}

const useFetchSectors = (options: UseFetchSectorsOptions = {}) => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalDocs, setTotalDocs] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [firstVisible, setFirstVisible] = useState<any>(null);
  const [previousPages, setPreviousPages] = useState<any[]>([]);

  const fetchSectors = async (
    pageIndex: number,
    startAfterDoc: any = null,
    isNext = true
  ) => {
    setLoading(true);
    setError(null);

    try {
      const { sectors: newSectors, lastVisible: newLastVisible, firstVisible: newFirstVisible, totalDocs, totalPages } =
        await getAllSectorsAdapter({
          ...options,
          searchFields: options.searchFields || {},
          sedeIds: options.sedeIds, // Aquí pasamos el array `sedeId` sin cambiar el nombre
        });

      setCurrentPage(pageIndex);
      setSectors(newSectors);
      setLastVisible(newLastVisible);
      setFirstVisible(newFirstVisible);
      setTotalDocs(totalDocs);
      setTotalPages(totalPages);

      if (isNext && newFirstVisible) {
        setPreviousPages((prev) => [...prev, newFirstVisible]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const nextPage = () => {
    if (!loading && currentPage < totalPages) {
      fetchSectors(currentPage + 1, lastVisible, true);
    }
  };

  const prevPage = () => {
    if (!loading && currentPage > 1) {
      const previousPageDoc = previousPages[previousPages.length - 2] || null;
      setPreviousPages((prev) => prev.slice(0, -1));
      fetchSectors(currentPage - 1, previousPageDoc, false);
    }
  };

  const loadPage = (pageIndex: number) => {
    if (!loading && pageIndex !== currentPage) {
      if (pageIndex > currentPage) {
        fetchSectors(pageIndex, lastVisible, true);
      } else if (pageIndex < currentPage) {
        const previousPageDoc = previousPages[previousPages.length - (currentPage - pageIndex + 1)] || null;
        setPreviousPages((prev) => prev.slice(0, -(currentPage - pageIndex)));
        fetchSectors(pageIndex, previousPageDoc, false);
      }
    }
  };

  useEffect(() => {
    fetchSectors(1);
  }, [options.searchFields, options.sedeIds]);

  return {
    sectors,
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

export default useFetchSectors;
