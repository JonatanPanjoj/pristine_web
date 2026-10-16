// models/ChecklistCategory.ts
// Firestore collection: "categories"

export interface ChecklistCategory {
  id: string;
  name: string;
  color: string;
  isEnabled: boolean;
  allowedUserIds: string[];
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
