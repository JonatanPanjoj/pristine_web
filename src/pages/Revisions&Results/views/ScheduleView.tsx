// src/pages/Revisions&Results/views/ScheduleView.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineCalendar, HiOutlineSearch } from 'react-icons/hi';
import ScheduleTable from '../components/ScheduleTable';
import useEnabledSedesForUser from '../../../components/sedesEnabled/hooks/useEnabledSedesForUser';
import { fetchSectorsBySedeIds } from '../../../components/sectorAll/hooks/fetchSectorsBySedeIds';
import useFetchCategorias from '../../CategoryChecklistCrud/hooks/useFetchCategorias';
import { Sector } from '../../../models/Sector';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

const FilterSelect: React.FC<{
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  children: React.ReactNode;
}> = ({ label, value, onChange, disabled, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-slate-700 ml-1">{label}</label>
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full py-2.5 px-4 text-xs font-semibold bg-slate-100/80 border-0 rounded-full text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-gold/40 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {children}
    </select>
  </div>
);

const ScheduleView: React.FC = () => {
  const [selectedSedeId, setSelectedSedeId] = useState<string | null>(null);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [sectorsLoading, setSectorsLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<{
    sedeId?: string | null;
    sectorId?: string | null;
    areaId?: number | null;
    categoryId?: string | null;
  }>({});

  const { sedes, loading: sedesLoading } = useEnabledSedesForUser();
  const { categorias, loading: catsLoading } = useFetchCategorias();

  const prevSedeIdsRef = useRef<string[]>([]);

  useEffect(() => {
    const sedeIds = selectedSedeId ? [selectedSedeId] : [];
    const prev = prevSedeIdsRef.current;
    const equal = prev.length === sedeIds.length && prev.every((id, i) => id === sedeIds[i]);

    if (!equal && sedeIds.length > 0) {
      prevSedeIdsRef.current = sedeIds;
      setSectorsLoading(true);
      fetchSectorsBySedeIds({ sedeIds }).then((loaded) => {
        setSectors(loaded);
        setSectorsLoading(false);
      });
    } else if (sedeIds.length === 0) {
      setSectors([]);
      prevSedeIdsRef.current = [];
    }
  }, [selectedSedeId]);

  const handleSedeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSedeId(e.target.value || null);
    setSelectedSectorId(null);
  };

  const handleSectorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSectorId(e.target.value || null);
  };

  const handleSearch = () => {
    setSearchParams({
      sedeId: selectedSedeId,
      sectorId: selectedSectorId,
      categoryId: selectedCategoryId,
    });
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col min-h-[calc(100vh-100px)] md:min-h-[calc(100vh-108px)]"
    >
      {/* Encabezado Superior (Header Card) */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] px-6 py-6 md:px-8 md:py-8 flex-shrink-0 mb-6 border-0"
      >
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-2xl bg-primary-dark text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <HiOutlineCalendar className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Registro de Revisiones de Checklist
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Consulta las programaciones activas del día e inicia o continúa revisiones de auditoría.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tarjeta de Filtros */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6 md:p-8 mb-6 border-0"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FilterSelect label="Sede" value={selectedSedeId || ''} onChange={handleSedeChange} disabled={sedesLoading}>
            <option value="">Selecciona una Sede</option>
            {sedes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect
            label="Sector"
            value={selectedSectorId || ''}
            onChange={handleSectorChange}
            disabled={sectorsLoading || !selectedSedeId}
          >
            <option value="">Selecciona un Sector</option>
            {sectors.length > 0 ? (
              sectors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))
            ) : (
              <option value="" disabled>
                Sin sectores
              </option>
            )}
          </FilterSelect>

          <FilterSelect
            label="Categoría"
            value={selectedCategoryId || ''}
            onChange={(e) => setSelectedCategoryId(e.target.value || null)}
            disabled={catsLoading}
          >
            <option value="">Selecciona una Categoría</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </FilterSelect>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSearch}
            className="flex items-center gap-2 rounded-full px-8 py-3 text-sm font-bold text-white bg-primary-dark shadow-[0_4px_12px_rgba(32,43,52,0.25)] hover:opacity-90 active:scale-95 transition-all"
          >
            <HiOutlineSearch className="w-4 h-4" />
            Buscar Programaciones
          </button>
        </div>
      </motion.div>

      {/* Contenedor Principal de la Tabla */}
      <motion.div variants={cardVariants} className="flex-1 flex flex-col min-h-0">
        <ScheduleTable searchParams={searchParams} />
      </motion.div>
    </motion.div>
  );
};

export default ScheduleView;
