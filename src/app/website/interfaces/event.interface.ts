export interface EventData {
  id: string;
  image: string;
  title: string;
  startDate: Date;
  endDate: Date;
  description: string;
  deals: string[]; // Array of Deal IDs
}
