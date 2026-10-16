import { Timestamp } from "firebase/firestore";

export interface HelpdeskTicketStatus {
  id: string | number;
  name: string;
  color: string;
}

export interface HelpdeskTicketPriority {
  id: string | number;
  name: string;
  color: string;
  responseTimeLimit?: string;
  solutionTimeLimit?: string;
}

export interface HelpdeskTicketCategory {
  id: string | number;
  name: string;
}

export interface HelpdeskTicketIncident {
  id: string | number;
  name: string;
}

export interface HelpdeskTicketLocation {
  sedeId: string | number;
  sedeName: string;
  sectorId: string | number;
  sectorName: string;
  areaId: string | number;
  areaName: string;
}

export interface HelpdeskAssignedUser {
  id: string;
  name: string;
  rol: string;
  email: string;
  url_photo: string | null;
  phone: string;
}

export interface HelpdeskTicketPhoto {
  photoId: string;
  url: string;
  createdAt: Timestamp | string;
  statusId?: string;
  statusName?: string;
}

export interface HelpdeskTicket {
  id: string; // Document ID from Firestore
  ticketId: string; // Human readable ticket ID (e.g. TICK-12345)
  description: string;
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
  status: HelpdeskTicketStatus;
  priority: HelpdeskTicketPriority;
  category: HelpdeskTicketCategory;
  incident: HelpdeskTicketIncident;
  location: HelpdeskTicketLocation;
  assignedUsersIds: string[];
  assignedUsers: HelpdeskAssignedUser[];
  photos?: HelpdeskTicketPhoto[];
  createdBy: HelpdeskAssignedUser;
  closedAt?: Timestamp | string;
  resolutionTimeInHours?: number;
  isClosed?: boolean;
}
