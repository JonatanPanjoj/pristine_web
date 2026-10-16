// models/ChecklistRevision.ts
// Firestore collection: "revisions"

export type ChecklistRevisionStatus = "pending" | "in_progress" | "completed" | "expired";

// Snapshot de checklist al momento de la revisión
export interface ChecklistRevisionChecklist {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
}

// Snapshot de ubicación al momento de la revisión
export interface ChecklistRevisionLocation {
  sedeId: string;
  sedeName: string;
  sectorId: string;
  sectorName: string;
  areaId: number;
  areaName: string;
}

// Snapshot del usuario ejecutor
export interface ChecklistRevisionUser {
  id: string;
  name: string;
}

// Snapshot del supervisor (opcional)
export interface ChecklistRevisionSupervisor {
  id: string;
  name: string;
}

// Respuesta individual — embebida en Revision.answers[]
// Reemplaza la subcolección "Responses"
export interface ChecklistRevisionAnswer {
  questionId: string;
  questionText: string;   // desnormalizado — evita lookup a Questions
  value: "yes" | "no" | "na";
  photoUrl: string | null;
  observations: string;
}

// Snapshot del horario de programación (opcional)
export interface ChecklistRevisionScheduleSnapshot {
  startTime: string;
  endTime: string;
  activeDay: string;
}

export interface ChecklistLocationPoint {
  latitude: number;
  longitude: number;
  altitude: number;
  timestamp: string;
}

export interface ChecklistRevision {
  id: string;
  correlativo?: number;
  numeroRevision?: number;
  sequentialId?: number;     // Correlativo numérico inmutable (ej. 1, 2)
  code?: string;             // ID amigable formateado (ej. "REV-000001")
  scheduleId: string;
  checklist: ChecklistRevisionChecklist;
  location: ChecklistRevisionLocation;
  scheduleSnapshot?: ChecklistRevisionScheduleSnapshot;
  user: ChecklistRevisionUser;
  status: ChecklistRevisionStatus;
  startDate: string;          // ISO 8601
  endDate: string | null;     // null mientras está en progreso
  durationSeconds: number | null;
  observations: string;
  signatureUrl: string | null;
  PhotoUrl: string | null;
  photoUrls?: string[] | null;
  PhotoUrls?: string[] | null;

  startLocation?: ChecklistLocationPoint;
  endLocation?: ChecklistLocationPoint;
  start_location?: ChecklistLocationPoint;
  end_location?: ChecklistLocationPoint;

  supervisor: ChecklistRevisionSupervisor | null;
  answers: ChecklistRevisionAnswer[]; // reemplaza subcolección Responses
  createdAt: string;          // ISO 8601
  updatedAt?: string;         // ISO 8601
}
