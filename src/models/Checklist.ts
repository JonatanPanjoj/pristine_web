// models/Checklist.ts
// Firestore collection: "checklists"

import { ChecklistQuestion } from "./ChecklistQuestion";

export interface Checklist {
  id: string;
  categoryId: string;
  categoryName: string;   // desnormalizado para evitar lookup extra
  name: string;
  isEnabled: boolean;
  needFirm: boolean;
  needPhoto: boolean;
  questions: ChecklistQuestion[]; // embebidas — reemplaza colección Questions
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
