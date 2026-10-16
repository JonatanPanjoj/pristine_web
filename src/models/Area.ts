export interface Area {
  id: string;             // ID único del área
  is_enabled?: boolean;   // Indicador de si el área está habilitada
  status?: boolean;
  name: string;           // Nombre del área
  level?: string;         // Nivel del área
  area_id: string | number; // ID del área específica
  SectorId?: string;      // ID del sector al que pertenece
  sector_id?: string;
  SedeId?: string;
  sede_id?: string;
}
