import { useState, useEffect, useCallback } from "react";
import { Checklist } from "../../../models/Checklist";
import { getAllChecklistsAdapter } from "../adapters/getAllChecklistsAdapter";
import { QueryDocumentSnapshot } from "firebase/firestore";

interface UseFetchChecklistsOptions {
  searchFields?: Partial<Omit<Checklist, "id" | "createdAt" | "questions">>;
  pageSize?: number;
  orderByField?: keyof Omit<Checklist, "questions">;
  orderDirection?: "asc" | "desc";
}

const useFetchChecklists = (options: UseFetchChecklistsOptions = {}) => {
  const [checklists,    setChecklists]    = useState<Checklist[]>([]);
  const [loading,       setLoading]       = useState<boolean>(true);
  const [error,         setError]         = useState<string | null>(null);
  const [totalDocs,     setTotalDocs]     = useState<number>(0);
  const [totalPages,    setTotalPages]    = useState<number>(0);
  const [currentPage,   setCurrentPage]   = useState<number>(1);
  const [lastVisible,   setLastVisible]   = useState<any>(null);
  const [firstVisible,  setFirstVisible]  = useState<any>(null);
  const [previousPages, setPreviousPages] = useState<any[]>([]);

  const fetchChecklists = useCallback(async (
    pageIndex: number,
    startAfterDoc: any = null,
    isNext = true
  ) => {
    setLoading(true);
    setError(null);
    try {
      const {
        checklists: newChecklists,
        lastVisible: newLastVisible,
        firstVisible: newFirstVisible,
        totalDocs,
        totalPages,
      } = await getAllChecklistsAdapter({
        ...options,
        pageIndex,
        pageSize: options.pageSize || 10,
        startAfterDoc,
        searchFields: options.searchFields || {},
      });

      setCurrentPage(pageIndex);
      setChecklists(newChecklists);
      setLastVisible(newLastVisible);
      setFirstVisible(newFirstVisible);
      setTotalDocs(totalDocs);
      setTotalPages(totalPages);

      if (isNext && newFirstVisible) {
        setPreviousPages((prev) => [...prev, newFirstVisible]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  }, [options.searchFields, options.pageSize, options.orderByField, options.orderDirection]);

  const nextPage = () => {
    if (!loading && currentPage < totalPages) {
      fetchChecklists(currentPage + 1, lastVisible, true);
    }
  };

  const prevPage = () => {
    if (!loading && currentPage > 1) {
      const previousPageDoc = previousPages[previousPages.length - 2] || null;
      setPreviousPages((prev) => prev.slice(0, -1));
      fetchChecklists(currentPage - 1, previousPageDoc, false);
    }
  };

  const loadPage = (pageIndex: number) => {
    if (!loading && pageIndex !== currentPage) {
      if (pageIndex > currentPage) {
        fetchChecklists(pageIndex, lastVisible, true);
      } else {
        const previousPageDoc =
          previousPages[previousPages.length - (currentPage - pageIndex + 1)] || null;
        setPreviousPages((prev) => prev.slice(0, -(currentPage - pageIndex)));
        fetchChecklists(pageIndex, previousPageDoc, false);
      }
    }
  };

  // ── Refresca la página 1 sin recargar la ventana ──────────────────────────
  const refresh = () => {
    setPreviousPages([]);
    fetchChecklists(1, null, true);
  };

  useEffect(() => {
    setPreviousPages([]);
    fetchChecklists(1);
  }, [options.searchFields]);

  return {
    checklists,
    loading,
    error,
    totalDocs,
    totalPages,
    currentPage,
    nextPage,
    prevPage,
    loadPage,
    refresh,   // ← nuevo: refresca la lista sin window.location.reload()
  };
};

export default useFetchChecklists;
