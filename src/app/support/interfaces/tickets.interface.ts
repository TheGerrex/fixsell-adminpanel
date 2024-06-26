import { User } from 'src/app/auth/interfaces';

export interface Ticket {
  title: string;
  type: Type;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
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
  appointmentStartTime: Date;
  appointmentEndTime: Date;
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

export enum Type {
  REMOTE = 'remote',
  ON_SITE = 'on-site',
}
