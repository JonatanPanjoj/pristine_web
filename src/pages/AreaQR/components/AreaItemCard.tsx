import React from 'react';
import { motion } from 'framer-motion';
import { HiOutlineOfficeBuilding } from 'react-icons/hi';
import { formatAreaCode } from '../utils/areaCode';

export interface AreaItemData {
  id: string;
  area_id: number;
  name: string;
  sedeName?: string | null;
  sectorName?: string | null;
  level?: string | number | null;
}

interface AreaItemCardProps {
  item: AreaItemData;
  isSelected: boolean;
  onToggleSelect: (item: AreaItemData) => void;
}

export const AreaItemCard: React.FC<AreaItemCardProps> = ({
  item,
  isSelected,
  onToggleSelect,
}) => {
  const codeStr = formatAreaCode(item.area_id);

  return (
    <motion.div
      initial={{ opacity: 1, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.995 }}
      onClick={() => onToggleSelect(item)}
      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
        isSelected
          ? 'bg-amber-50/40 border-amber-300 shadow-[0_4px_16px_rgba(252,181,33,0.12)]'
          : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
      }`}
    >
      {/* Checkbox + Icono + Info Principal */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => {}} // Manejado por onClick del contenedor
          className="w-4 h-4 rounded border-slate-300 text-primary-gold focus:ring-primary-gold/40 cursor-pointer shrink-0"
        />

        {/* Icono circular amarillo */}
        <div className="w-10 h-10 rounded-full bg-primary-gold text-white flex items-center justify-center shrink-0 shadow-sm">
          <HiOutlineOfficeBuilding className="w-5 h-5" />
        </div>

        {/* Nombre, Badge de Nivel y Código */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-800 truncate">
              {item.name}
            </span>
            {item.level && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6] shrink-0">
                Nivel {item.level}
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
            Código: {codeStr}
          </span>
        </div>
      </div>

      {/* Meta Sede y Sector a la derecha */}
      <div className="text-right shrink-0 text-[11px] text-slate-500 font-medium pl-2 hidden sm:block">
        <div>Sede: <span className="text-slate-700 font-semibold">{item.sedeName || 'Pristine'}</span></div>
        <div>Sector: <span className="text-slate-700 font-semibold">{item.sectorName || 'Pristine'}</span></div>
      </div>
    </motion.div>
  );
};

export default AreaItemCard;
