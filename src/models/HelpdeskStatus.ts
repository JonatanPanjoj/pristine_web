export interface HelpdeskStatus {
  id: string; // Firestore Document ID
  statusId: string; // Firestore Document ID
  name: string;
  color: string; // Hex color string
  position: number; // Order/position of status in flow
  isActive: boolean;
  updatedAt?: any;
}
