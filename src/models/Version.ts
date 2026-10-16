// src/models/Version.ts
import { Timestamp } from "firebase/firestore";

// Colección Firestore: "app_version"
// El ID real del registro es el ID de documento de Firestore (campo `id`).
// `ver_codigo` y `ver_usuario_update` son campos heredados de la migración
// y pueden ir vacíos (null) en los registros creados desde la app.
export interface Version {
  id?: string;                         // ID de documento de Firestore (PK real)
  ver_codigo?: number | null;          // bigint(20) — PK de migración, puede ir vacío
  ver_software: string;                // varchar(250)
  ver_plataforma: string;              // varchar(10)  (android | ios | web)
  ver_version: string;                 // varchar(5)
  ver_fecha_update?: Timestamp;        // datetime — fecha de la última actualización
  ver_usuario_update?: number | null;  // bigint(20) — usuario de migración, puede ir vacío
  ver_usuario_id?: string;             // ID Firebase del usuario que actualizó
  ver_download_url: string;            // varchar(500)
}
