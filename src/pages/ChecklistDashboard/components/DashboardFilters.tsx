import React, { useEffect, useState } from "react";
import Select from "react-select";
import { FiFilter, FiChevronDown, FiChevronUp } from "react-icons/fi";
import useEnabledSedesForUser from "../../../components/sedesEnabled/hooks/useEnabledSedesForUser";
import { getSectorsBySedeId } from "../../areaCRUD/adapters/getSectorsBySedeId";
import { getAllAreasAdapter } from "../../areaCRUD/adapters/getAllAreasAdapter";
import { getAllChecklistCategoriasAdapter } from "../../CategoryChecklistCrud/adapters/getAllChecklistCategoriasAdapter";
import { Sector } from "../../../models/Sector";
import { Area } from "../../../models/Area";

interface DashboardFiltersProps {
  onSearch: (filters: any) => void;
  onReset: () => void;
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({ onSearch, onReset }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Hook de Sedes habilitadas
  const { sedes: enabledSedes = [], loading: loadingSedes } = useEnabledSedesForUser();

  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loadingSectors, setLoadingSectors] = useState(false);

  const [areas, setAreas] = useState<Area[]>([]);
  const [loadingAreas, setLoadingAreas] = useState(false);

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const statusOptions = [
    { value: "completed", label: "Finalizado / Completado" },
    { value: "in_progress", label: "En Proceso" },
    { value: "pending", label: "Pendiente" },
    { value: "expired", label: "Vencido" },
  ];

  // Valores de los filtros
  const [values, setValues] = useState({
    sedeId: "",
    sectorId: "",
    areaId: "",
    categoryId: "",
    statusId: "",
    startDate: "",
    endDate: "",
  });

  // Cargar categorías de checklist al montar
  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true);
      try {
        const res = await getAllChecklistCategoriasAdapter({ pageSize: 100 });
        const catList = (res.categorias || []).map((c) => ({
          id: c.id,
          name: c.name,
        }));
        setCategories(catList);
      } catch (err) {
        console.error("Error al cargar categorías de checklist:", err);
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  // Cargar Sectores en cascada por Sede
  const handleSedeChange = async (opt: any) => {
    const sedeId = opt ? opt.value : "";
    setValues((prev) => ({ ...prev, sedeId, sectorId: "", areaId: "" }));
    setSectors([]);
    setAreas([]);

    if (sedeId) {
      setLoadingSectors(true);
      try {
        const sectRes = await getSectorsBySedeId(sedeId);
        setSectors(sectRes || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingSectors(false);
      }
    }
  };

  // Cargar Áreas en cascada por Sector
  const handleSectorChange = async (opt: any) => {
    const sectorId = opt ? opt.value : "";
    setValues((prev) => ({ ...prev, sectorId, areaId: "" }));
    setAreas([]);

    if (sectorId) {
      setLoadingAreas(true);
      try {
        const areaRes = await getAllAreasAdapter({
          sectorIds: [sectorId],
          pageSize: 100,
        });
        setAreas(areaRes.areas || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingAreas(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(values);
  };

  const handleReset = () => {
    const cleanValues = {
      sedeId: "",
      sectorId: "",
      areaId: "",
      categoryId: "",
      statusId: "",
      startDate: "",
      endDate: "",
    };
    setValues(cleanValues);
    setSectors([]);
    setAreas([]);
    onReset();
  };

  // Estilos de React-Select personalizados
  const customSelectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      borderRadius: "9999px",
      borderColor: state.isFocused ? "#FCB521" : "#E2E8F0",
      boxShadow: state.isFocused ? "0 0 0 1px #FCB521" : "none",
      "&:hover": {
        borderColor: "#FCB521",
      },
      fontSize: "12px",
      minHeight: "36px",
      backgroundColor: "white",
      paddingLeft: "8px",
      paddingRight: "8px",
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#FCB521"
        : state.isFocused
        ? "rgba(252, 181, 33, 0.15)"
        : "transparent",
      color: state.isSelected ? "white" : "#334155",
      "&:hover": {
        backgroundColor: "#FCB521",
        color: "white",
      },
      fontSize: "12px",
    }),
    placeholder: (base: any) => ({
      ...base,
      color: "#94A3B8",
    }),
    menu: (base: any) => ({
      ...base,
      zIndex: 50,
    }),
  };

  return (
    <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] border-0 mb-6 flex flex-col">
      {/* Botón de cabecera colapsable */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full bg-primary-gold px-6 py-4 font-bold text-white text-[14px] flex items-center justify-between transition-all focus:outline-none hover:opacity-95 ${
          isExpanded ? "rounded-t-[32px]" : "rounded-[32px]"
        }`}
      >
        <div className="flex items-center gap-2">
          <FiFilter className="w-4 h-4" />
          <span>Filtros de búsqueda de Checklist (Opcionales)</span>
        </div>
        {isExpanded ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
      </button>

      {/* Panel colapsable */}
      {isExpanded && (
        <form onSubmit={handleSubmit} className="p-5 space-y-4 border-t border-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Sede */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Sede</label>
              <Select
                placeholder="Todas las sedes"
                styles={customSelectStyles}
                isClearable
                options={enabledSedes.map((s) => ({ value: s.id, label: s.name }))}
                isLoading={loadingSedes}
                value={values.sedeId ? { value: values.sedeId, label: enabledSedes.find((s) => s.id === values.sedeId)?.name || "" } : null}
                onChange={handleSedeChange}
              />
            </div>

            {/* Sector */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Sector</label>
              <Select
                placeholder="Todos los sectores"
                styles={customSelectStyles}
                isClearable
                options={sectors.map((s) => ({ value: s.id, label: s.name }))}
                isLoading={loadingSectors}
                isDisabled={!values.sedeId}
                value={values.sectorId ? { value: values.sectorId, label: sectors.find((s) => s.id === values.sectorId)?.name || "" } : null}
                onChange={handleSectorChange}
              />
            </div>

            {/* Área */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Área</label>
              <Select
                placeholder="Todas las áreas"
                styles={customSelectStyles}
                isClearable
                options={areas.map((a) => ({ value: a.id, label: a.name }))}
                isLoading={loadingAreas}
                isDisabled={!values.sectorId}
                value={values.areaId ? { value: values.areaId, label: areas.find((a) => a.id === values.areaId)?.name || "" } : null}
                onChange={(opt) => setValues((prev) => ({ ...prev, areaId: opt ? String(opt.value) : "" }))}
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Categoría</label>
              <Select
                placeholder="Todas las categorías"
                styles={customSelectStyles}
                isClearable
                isLoading={loadingCategories}
                options={categories.map((c) => ({ value: c.id, label: c.name }))}
                value={values.categoryId ? { value: values.categoryId, label: categories.find((c) => c.id === values.categoryId)?.name || "" } : null}
                onChange={(opt) => setValues((prev) => ({ ...prev, categoryId: opt ? opt.value : "" }))}
              />
            </div>

            {/* Estatus */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Estado</label>
              <Select
                placeholder="Todos los estados"
                styles={customSelectStyles}
                isClearable
                options={statusOptions}
                value={values.statusId ? { value: values.statusId, label: statusOptions.find((s) => s.value === values.statusId)?.label || "" } : null}
                onChange={(opt) => setValues((prev) => ({ ...prev, statusId: opt ? opt.value : "" }))}
              />
            </div>

            {/* Fechas */}
            <div className="sm:col-span-2 md:col-span-1">
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Rango de Fechas</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={values.startDate}
                  onChange={(e) => setValues((prev) => ({ ...prev, startDate: e.target.value }))}
                  className="w-full text-xs text-slate-700 border border-slate-200 rounded-full px-3 py-1.5 focus:outline-none focus:border-primary-gold focus:ring-1 focus:ring-primary-gold"
                />
                <input
                  type="date"
                  value={values.endDate}
                  onChange={(e) => setValues((prev) => ({ ...prev, endDate: e.target.value }))}
                  className="w-full text-xs text-slate-700 border border-slate-200 rounded-full px-3 py-1.5 focus:outline-none focus:border-primary-gold focus:ring-1 focus:ring-primary-gold"
                />
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full transition-all active:scale-95 text-center"
            >
              Limpiar
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-xs font-bold text-white bg-primary-gold hover:opacity-90 rounded-full transition-all active:scale-95 text-center shadow-[0_4px_12px_rgba(221,152,3,0.15)]"
            >
              Buscar
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default DashboardFilters;
