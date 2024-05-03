import { User } from 'src/app/auth/interfaces';

export interface Ticket {
  title: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  issue: string;
  activity: any[];
  priority: Priority;
  status: Status;
  assigned: User;
  assignee: User;
  ticketFiles: any;
  createdDate: string;
  updatedDate: string;
  id: number;
}

export enum Status {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  WITHOUT_RESOLUTION = 'without_resolution',
  COMPLETED = 'completed',
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}
