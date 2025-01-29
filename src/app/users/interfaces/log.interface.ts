export interface Log {
  id: number;
  userId: string;
  userName: string | null;
  action: string;
  entity: string;
  entityId: string;
  method: string;
  url: string;
  ip: string;
  timestamp: string;
}
