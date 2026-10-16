export interface Sector {
    id: string;           // ID único del sector
    is_enabled: boolean;  // Indicador de si el sector está habilitado
    name: string;         // Nombre del sector
    sec_Area: string[];  // Lista de IDs 
    sector_id: string;    // ID del nivel o categoría al que pertenece el sector
    SedeId: string;

  }
  