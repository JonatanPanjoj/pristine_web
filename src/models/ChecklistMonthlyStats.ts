// models/ChecklistMonthlyStats.ts
// Firestore collection: "monthly_stats"
// ID del documento: "{yearMonth}_{sedeId}"  ej: "2026-06_IzgJR6Y0CCgvWUB2RcZE"

export interface ChecklistRevisionCounts {
  total: number;
  completed: number;
  pending: number;
}

export interface ChecklistMonthlyStats {
  id: string;                         // "{yearMonth}_{sedeId}"
  yearMonth: string;                  // "YYYY-MM"
  sedeId: string;
  sedeName: string;                   // desnormalizado
  revisionsCount: ChecklistRevisionCounts;
  complianceRateSum: number;          // suma acumulada de tasas individuales
  complianceRateAverage: number;      // complianceRateSum / revisionsCount.completed
  updatedAt: string;                  // ISO 8601 — se actualiza en cada revisión completada
}
