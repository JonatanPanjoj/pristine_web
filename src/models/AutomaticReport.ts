// src/models/AutomaticReport.ts
import { Timestamp } from "firebase/firestore";

// Colección Firestore: "system_automatic_reports"
// Cada documento define a quién se le envía por correo un reporte automático,
// de qué módulo y sobre qué sedes.
// El ID real del registro es el ID de documento de Firestore (campo `id`).
export type AutomaticReportModule = "checklist" | "helpdesk" | "ppm" | "auditoria";

// Período que cubre el reporte. Los módulos distintos de checklist envían el
// consolidado del día, por eso su período es siempre "dia".
export type AutomaticReportPeriod =
  | "dia"
  | "semana"
  | "quincena"
  | "mes"
  | "semestre"
  | "anio";

export interface AutomaticReport {
  id?: string;                        // ID de documento de Firestore (PK real)
  rep_usuario_id: string;             // ID Firestore del usuario destinatario
  rep_usuario_nombre: string;         // varchar(250) — nombre desnormalizado para listados
  rep_correo: string;                 // varchar(250) — correo al que se envía el reporte
  rep_modulo: AutomaticReportModule;  // varchar(20)  (checklist | helpdesk | ppm | auditoria)
  rep_periodo: AutomaticReportPeriod; // varchar(10)  — rango de datos que cubre el envío
  rep_hora: string;                   // varchar(5)   — hora de envío en formato "HH:mm"
  rep_dia_semana?: number | null;     // 0=Domingo … 6=Sábado; sólo para períodos de checklist
  rep_todas_sedes: boolean;           // true = aplica a todas las sedes
  rep_sedes: string[];                // IDs Firestore de sedes; vacío cuando rep_todas_sedes
  rep_is_enabled: boolean;            // envío activo o pausado
  rep_fecha_update?: Timestamp;       // datetime — fecha de la última actualización
  rep_usuario_update_id?: string;     // ID Firebase del usuario que actualizó
  // Escritos únicamente por la Cloud Function de envío; la app sólo los lee.
  rep_ultimo_envio?: Timestamp;       // datetime — último envío realizado
  rep_ultimo_envio_key?: string;      // varchar(16) — "YYYY-MM-DD HH:mm", evita reenvíos
}
