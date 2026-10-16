import { Timestamp } from "firebase/firestore";
import { HelpdeskAssignedUser } from "./HelpdeskTicket";

export interface HelpdeskTicketHistory {
  id?: string; // Firestore history document ID
  historyId: string;
  type: string; // e.g. STATUS_CHANGE, COMMENT, CREATION
  createdAt: Timestamp | string;
  user: HelpdeskAssignedUser;
  action: string;
  observations: string;
  previousStatus?: string;
  newStatus?: string;
  urlImages?: string[];
}
