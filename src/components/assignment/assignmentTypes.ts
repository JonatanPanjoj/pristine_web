// components/assignment/assignmentTypes.ts
// Contratos compartidos del asignador usuario ↔ destino (sedes, categorías, …).

export interface AssignUser {
  id: string;
  name: string;
  email?: string;
}

export interface AssignTarget {
  id: string;
  name: string;
  subtitle?: string;
  assignedUserIds: string[];
}

export interface AssignmentChange {
  userId: string;
  addTargetIds: string[];
  removeTargetIds: string[];
}

/** Estado de un destino respecto a los usuarios seleccionados. */
export type AssignmentState = 'all' | 'some' | 'none';

/** Filtro de la lista de destinos. */
export type AssignmentFilter = 'all' | 'assigned' | 'unassigned';
