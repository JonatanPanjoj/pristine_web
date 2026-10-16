export interface Programming {
    programming_id: number; // ID de la programación (número), ej. 115
    id: string; // ID generado por Firestore (cadena), ej. "0FNTUpQVX1TWJYwXqeCu"
    id_List: string; // ID de la lista (cadena), ej. "mnA379qJNvSYjMVAEU4o"
    SedeId: string; // ID de la sede (cadena), ej. "qlBlPYQra9CVFtxkdJba"
    SectorId: string; // ID del sector (cadena), ej. "ppviDFQUGKgIRd7ZWmkB"
    AreaId: number; // ID del área (número), ej. 63
    is_day_1: boolean; // Día 1 seleccionado o no (booleano), ej. true
    is_day_2: boolean; // Día 2 seleccionado o no (booleano), ej. true
    is_day_3: boolean; // Día 3 seleccionado o no (booleano), ej. true
    is_day_4: boolean; // Día 4 seleccionado o no (booleano), ej. true
    is_day_5: boolean; // Día 5 seleccionado o no (booleano), ej. true
    is_day_6: boolean; // Día 6 seleccionado o no (booleano), ej. true
    is_day_7: boolean; // Día 7 seleccionado o no (booleano), ej. true
    start_time: string; // Hora de inicio (cadena), ej. "06:00:00"
    fin_time: string; // Hora de fin (cadena), ej. "22:00:00"
    observations: string; // Observaciones (cadena), ej. "supervisión o ronda 1, Subestación eléctrica"
    is_enabled: boolean; // Estado habilitado o no (booleano), ej. true
  }
  