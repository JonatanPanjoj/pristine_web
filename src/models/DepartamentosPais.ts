export interface DepartamentosPais {
    id: string;  // ID del documento en Firestore (colección core_departments_country)
    ID_Departamento: string;  // Código del departamento (dm_codigo de MySQL)
    name: string;  // Nombre del departamento (dm_desc de MySQL, sin coma)
    municipios: Municipio[];  // Lista de municipios asociados
  }
  
  export interface Municipio {
    id: string;  // ID del documento de municipio en Firestore
    ID_Municipio: string;  // Código del municipio (dm_codigo de MySQL)
    name: string;  // Nombre del municipio (dm_desc de MySQL)
  }
  