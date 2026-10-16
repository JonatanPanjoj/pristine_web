// models/ChecklistSchedule.ts
// Firestore collection: "schedules"

export interface ChecklistActiveDays {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

export interface ChecklistSchedule {
  id: string;
  checklistId: string;
  checklistName: string;  // desnormalizado para evitar lookup extra
  sedeId: string;
  sectorId: string;
  areaId: number;
  startTime: string;      // "HH:MM:SS"
  endTime: string;        // "HH:MM:SS"
  activeDays: ChecklistActiveDays;
  isEnabled: boolean;
  observations: string;
  createdAt: string;      // ISO 8601
  updatedAt: string;      // ISO 8601
}
