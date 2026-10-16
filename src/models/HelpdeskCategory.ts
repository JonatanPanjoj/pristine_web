export interface HelpdeskCategory {
  id: string; // Firestore Document ID
  categoryId: string; // Firestore Document ID (for compatibility mapping)
  name: string;
  color: string; // Hex color string
  status: number; // 1 = Activo, 0 = Inactivo
  allowedUserIds: string[]; // Array of User document IDs or usernames
  updatedAt?: any;
}
