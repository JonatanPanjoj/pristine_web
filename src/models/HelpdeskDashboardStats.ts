export interface HelpdeskDashboardStats {
  totalTickets: number;
  closedTicketsCount: number;
  statusCount: Record<string, number>;
  priorityCount: Record<string, number>;
  priorityColors: Record<string, string>;
  slaCompliance: number;
  averageResolutionTime: number;
  mostIncidentsArea: {
    areaName: string;
    ticketCount: number;
  };
  createdVsClosed: Array<{
    name: string;
    created: number;
    closed: number;
  }>;
  closedOnTimeVsLate: Array<{
    name: string;
    onTime: number;
    late: number;
  }>;
  activeTicketsByLocation: Array<{
    name: string;
    [statusName: string]: number | string;
  }>;
  agingData: Array<{
    name: string;
    value: number;
  }>;
  urgentTickets: Array<{
    id: string;
    area: string;
    priority: string;
    timeOpen: string;
    assignee: string;
    solutionTime: string;
  }>;
  urgentPriorityLabel: string;
  lastUpdatedAt: string;
}
