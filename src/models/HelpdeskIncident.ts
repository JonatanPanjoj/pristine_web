export interface HelpdeskIncident {
  id: string; // Firestore Document ID
  incidentId: string; // Firestore Document ID
  categoryId: string; // Referenced Category Document ID
  name: string;
  defaultPriorityId: string; // Referenced Priority Document ID (from Priority collection)
  allowedUserIds: string[]; // Array of user IDs assigned
  isActive: boolean;
  updatedAt?: any;
}
