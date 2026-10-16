import { Timestamp } from "firebase/firestore";

export interface Sede {
    id: string;  // ID del documento en Firestore
    sede_id: string;  // ID de MySQL (sed_codigo)
    name: string;  // Nombre de la sede (sed_nombre)
    department: string;  // ID del departamento (Firestore ID de core_departments_country)
    municipality: string;  // ID del municipio (Firestore ID dentro del documento core_departments_country)
    address: string;  // Dirección de la sede (sed_direccion)
    zone: string;  // Zona de la sede (sed_zona convertido a string)
    latitude: string;  // Latitud de la sede (sed_latitud)
    length: string;  // Longitud de la sede (sed_longitud)
    sector: string[];  // Lista de IDs de sectores asociados (Firestore IDs)
    url_photo: string | null;  // URL de la foto (opcional, puede ser nulo)
    is_enabled: boolean;  // Estado habilitado o no (sed_situacion)
    updatedAt: Timestamp| { seconds: number; nanoseconds: number } ;
    user_ids?: string[];
    fechas_feriado?:| string[];  // Lista de fechas feriadas (opcional, puede ser nulo)
  }
  