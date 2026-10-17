// src/pages/AreaQR/components/AreaTable.tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import useFetchAreas from '../hooks/useFetchAreas';
import getSedeNameBySectorId from '../hooks/getSedeNameBySectorId';
import { fetchSectorName } from '../hooks/fetchSectorName';
import FormModal from '../../../components/FormModal';
import QRCodeGenerator from './QRCodeGenerator';
import { formatAreaCode } from '../utils/areaCode';
import { getAllSedesFromCache } from '../../../services/sedeStorage';
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiSearch,
  FiX,
  FiLayers,
} from 'react-icons/fi';
import { BsQrCode } from 'react-icons/bs';

interface AreaTableProps {
  searchFields?: Partial<{ name: string }>;
  setSearchFields?: React.Dispatch<React.SetStateAction<Partial<{ name: string }>>>;
  searchTrigger?: number;
  sectorIds?: string[];
}

const CodeBadge: React.FC<{ code: number }> = ({ code }) => (
  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
    {formatAreaCode(code)}
  </span>
);

const COL_HEADERS = ['Código', 'Nombre del Área', 'Sede', 'Sector', 'Nivel', 'Acción QR'];

const AreaTable: React.FC<AreaTableProps> = ({
  searchFields,
  setSearchFields,
  sectorIds,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const { areas, loading, error, loadPage, currentPage, totalPages, totalDocs } = useFetchAreas({
    pageSize,
    searchFields,
    sectorIds,
  });

  const [localAreas, setLocalAreas] = useState<any[]>([]);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrCodeValue, setQrCodeValue] = useState('');
  const [selectedAreaForQr, setSelectedAreaForQr] = useState<any>(null);

  useEffect(() => {
    const fetchNames = async () => {
      if (areas.length === 0) {
        setLocalAreas([]);
      } else {
        const allSedes = getAllSedesFromCache() || [];
        const areasWithNames = await Promise.all(
          areas.map(async (area: any) => {
            const matchingSede = allSedes.find(
              (s: any) => s.id === area.SedeId || s.id === area.sede_id || s.sede_id === area.SedeId
            );
            const sedeName = matchingSede?.name || (await getSedeNameBySectorId(area.SedeId));
            const sectorName = await fetchSectorName(area.SectorId);
            const sedePhoto = matchingSede?.url_photo || null;
            return { ...area, sedeName, sectorName, sedePhoto };
          })
        );
        setLocalAreas(areasWithNames);
      }
    };
    fetchNames();
  }, [areas]);

  const handleSearch = () => {
    if (setSearchFields) {
      setSearchFields(searchTerm.trim() ? { name: searchTerm.trim() } : {});
    }
  };

  const handleOpenQrModal = (area: any) => {
    const qrData = `${area.name}\nCódigo: ${formatAreaCode(area.area_id)}\nSede: ${area.sedeName}\nNivel: ${area.level}`.trim();
    setQrCodeValue(qrData);
    setSelectedAreaForQr(area);
    setQrModalOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage !== currentPage) loadPage(newPage);
  };

  return (
    <div className="relative bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6 md:p-8 flex flex-col flex-1 min-h-0 select-none border-0">
      {error && (
        <div className="mb-4 px-4 py-2 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600 font-medium">
          {error}
        </div>
      )}

      {/* Fila Superior de Controles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 mt-1 flex-shrink-0">
        {/* Limitador Registros */}
        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
          <span>Mostrar:</span>
          <div className="relative">
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="appearance-none bg-primary-dark text-white font-bold px-4 py-1.5 pr-8 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-primary-dark/40 shadow-sm cursor-pointer text-xs"
            >
              <option value={5} className="text-slate-800 font-semibold bg-white">
                5
              </option>
              <option value={10} className="text-slate-800 font-semibold bg-white">
                10
              </option>
              <option value={25} className="text-slate-800 font-semibold bg-white">
                25
              </option>
              <option value={50} className="text-slate-800 font-semibold bg-white">
                50
              </option>
            </select>
            <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white pointer-events-none w-3.5 h-3.5" />
          </div>
          <span>por página</span>
        </div>

        {/* Buscador Píldora */}
        <div className="relative w-full sm:w-64">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar área..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch();
            }}
            className="w-full bg-slate-100/80 border-0 rounded-full pl-10 pr-8 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-gold/40 transition-all font-semibold"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                if (setSearchFields) setSearchFields({});
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <FiX className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Estructura Pildórica de la Tabla */}
      <div className="flex-1 overflow-auto min-h-0 scrollbar-none">
        <table className="w-full border-separate border-spacing-y-4 text-center">
          <thead>
            <tr className="text-white text-xs font-bold uppercase tracking-wider">
              {COL_HEADERS.map((h) => (
                <th
                  key={h}
                  className="py-2 px-4 bg-primary-gold first:rounded-l-full last:rounded-r-full"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td
                      key={j}
                      className="py-2 px-4 bg-[#FAFAFA] first:rounded-l-full last:rounded-r-full"
                    >
                      <div className="h-4 bg-neutral-200 rounded w-16 mx-auto"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : localAreas.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400 text-sm font-medium">
                  <FiLayers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  No se encontraron áreas
                </td>
              </tr>
            ) : (
              localAreas.map((row) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="hover:shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-shadow group"
                >
                  {/* Código Badge */}
                  <td className="py-2 px-4 bg-[#FAFAFA] first:rounded-l-full last:rounded-r-full">
                    <CodeBadge code={row.area_id} />
                  </td>

                  {/* Nombre (Campo Clave) */}
                  <td className="py-2 px-4 bg-[#FAFAFA] text-slate-800 text-sm font-bold first:rounded-l-full last:rounded-r-full text-left">
                    <div className="flex items-center gap-2.5">
                      {/* <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
                        {row.name?.charAt(0)?.toUpperCase() ?? '?'}
                      </div> */}
                      <span className="truncate max-w-[180px]">{row.name}</span>
                    </div>
                  </td>

                  {/* Sede */}
                  <td className="py-2 px-4 bg-[#FAFAFA] text-xs text-slate-600 font-semibold first:rounded-l-full last:rounded-r-full">
                    {row.sedeName || '—'}
                  </td>

                  {/* Sector */}
                  <td className="py-2 px-4 bg-[#FAFAFA] text-xs text-slate-600 font-semibold first:rounded-l-full last:rounded-r-full">
                    {row.sectorName || '—'}
                  </td>

                  {/* Nivel */}
                  <td className="py-2 px-4 bg-[#FAFAFA] first:rounded-l-full last:rounded-r-full">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                      {row.level || '—'}
                    </span>
                  </td>

                  {/* Acción QR */}
                  <td className="py-2 px-4 bg-[#FAFAFA] first:rounded-l-full last:rounded-r-full">
                    <button
                      onClick={() => handleOpenQrModal(row)}
                      title="Generar y visualizar QR"
                      className="w-7 h-7 rounded-lg bg-primary-gold text-white flex items-center justify-center hover:opacity-90 transition-all active:scale-95 shadow-sm mx-auto"
                    >
                      <BsQrCode className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Controles de Paginación */}
      <div className="mt-6 flex items-center justify-between flex-shrink-0 flex-wrap gap-4 pt-4 border-t border-slate-100">
        <div className="text-sm font-semibold text-slate-500">
          {totalDocs > 0
            ? `${(currentPage - 1) * pageSize + 1}-${Math.min(
              currentPage * pageSize,
              totalDocs
            )} de ${totalDocs} resultados`
            : "0 resultados"}
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="w-9 h-9 rounded-full bg-primary-gold text-white flex items-center justify-center shadow-md hover:opacity-95 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <FiChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <div className="w-9 h-9 rounded-full bg-primary-gold text-white flex items-center justify-center font-bold text-sm shadow-md select-none">
            {currentPage}
          </div>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            className="w-9 h-9 rounded-full bg-primary-gold text-white flex items-center justify-center shadow-md hover:opacity-95 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <FiChevronRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Modal QR */}
      {qrModalOpen && (
        <FormModal
          isOpen={qrModalOpen}
          onClose={() => { setQrModalOpen(false); setSelectedAreaForQr(null); }}
          maxWidth="max-w-md"
        >
          <div className="text-center p-4">
            <QRCodeGenerator
              text={qrCodeValue}
              sedePhoto={selectedAreaForQr?.sedePhoto}
              sedeName={selectedAreaForQr?.sedeName}
            />
            <button
              onClick={() => { setQrModalOpen(false); setSelectedAreaForQr(null); }}
              className="mt-6 px-8 py-3 bg-primary-dark text-white rounded-full hover:opacity-90 transition-all font-bold text-sm shadow-[0_4px_12px_rgba(32,43,52,0.25)] active:scale-95"
            >
              Cerrar
            </button>
          </div>
        </FormModal>
      )}
    </div>
  );
};

export default AreaTable;