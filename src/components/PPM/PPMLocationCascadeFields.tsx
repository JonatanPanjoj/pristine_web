import React from 'react';
import { Sede } from '../../models/Sede';
import { Sector } from '../../models/Sector';
import { Area } from '../../models/Area';

export interface PPMLocationSelection {
  sedeId: string;
  sectorId: string;
  areaId: string;
}

interface PPMLocationCascadeFieldsProps {
  sedes: Sede[];
  getSectorsBySedeId: (sedeId: string) => Sector[];
  getAreasBySectorId: (sectorId: string) => Area[];
  value: PPMLocationSelection;
  onChange: (value: PPMLocationSelection) => void;
}

// Selección en cascada Sede → Sector → Área compartida por los formularios PPM.
export const PPMLocationCascadeFields: React.FC<PPMLocationCascadeFieldsProps> = ({
  sedes,
  getSectorsBySedeId,
  getAreasBySectorId,
  value,
  onChange
}) => {
  const availableSectors = getSectorsBySedeId(value.sedeId);
  const availableAreas = getAreasBySectorId(value.sectorId);

  return (
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
      <span className="text-xs font-bold text-primary-dark uppercase tracking-wider">Ubicación Técnica</span>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">1. Sede *</label>
          <select
            value={value.sedeId}
            onChange={(e) => onChange({ sedeId: e.target.value, sectorId: '', areaId: '' })}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none"
          >
            <option value="">{sedes.length === 0 ? 'Sin sedes registradas' : 'Seleccione una sede'}</option>
            {sedes.map((sede) => (
              <option key={sede.id} value={sede.id}>{sede.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">2. Sector *</label>
          <select
            value={value.sectorId}
            onChange={(e) => onChange({ ...value, sectorId: e.target.value, areaId: '' })}
            disabled={availableSectors.length === 0}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none disabled:bg-slate-100"
          >
            <option value="">
              {availableSectors.length === 0 ? 'Sin sectores disponibles' : 'Seleccione un sector'}
            </option>
            {availableSectors.map((sector) => (
              <option key={sector.id} value={sector.id}>{sector.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">3. Área *</label>
          <select
            value={value.areaId}
            onChange={(e) => onChange({ ...value, areaId: e.target.value })}
            disabled={availableAreas.length === 0}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none disabled:bg-slate-100"
          >
            <option value="">{availableAreas.length === 0 ? 'Sin áreas disponibles' : 'Seleccione un área'}</option>
            {availableAreas.map((area) => (
              <option key={area.id} value={area.id}>{area.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
