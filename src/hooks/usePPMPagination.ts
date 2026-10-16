import { useState, useMemo, useEffect } from 'react';

const DEFAULT_PAGE_SIZE = 10;

/**
 * Paginación en cliente compartida por los listados del módulo PPM.
 * @param items - Colección ya filtrada que se va a paginar.
 * @param initialPageSize - Registros por página inicial.
 */
export const usePPMPagination = <T,>(items: T[], initialPageSize: number = DEFAULT_PAGE_SIZE) => {
  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const totalDocs = items.length;
  const totalPages = Math.max(1, Math.ceil(totalDocs / pageSize));

  // Evita quedarse en una página vacía cuando cambian filtros o tamaño de página.
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [currentPage, totalPages]);

  const pageItems = useMemo(
    () => items.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [items, currentPage, pageSize]
  );

  const changePageSize = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  return { pageItems, pageSize, changePageSize, currentPage, setCurrentPage, totalPages, totalDocs };
};

export default usePPMPagination;
