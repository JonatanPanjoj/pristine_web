export interface SectionPerformanceStat {
  section_name: string;
  porcentaje_cumplimiento: number;
  puntos_obtenidos: number;
  puntos_maximos: number;
}

export interface MonthlyComplianceTrend {
  month: string;
  porcentaje_cumplimiento: number;
  meta: number;
}

export interface SedeAuditDistribution {
  sede_name: string;
  aprobadas: number;
  reprobadas: number;
}

export interface AuditoriaDashboardStats {
  cumplimiento_global_porcentaje: number;
  auditorias_finalizadas_count: number;
  auditorias_en_ejecucion_count: number;
  auditorias_vencidas_count: number;
  auditorias_programadas_count: number;
  secciones_desempeno: SectionPerformanceStat[];
  tendencia_mensual: MonthlyComplianceTrend[];
  distribucion_sedes: SedeAuditDistribution[];
  last_updated_at: string;
}
