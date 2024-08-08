import { User } from 'src/app/auth/interfaces';

export interface Lead {
  id: number;
  client: string;
  status: string;
  product_interested: string;
  type_of_product: string;
  email: string;
  phone: string;
  communications: Communication[];
  assigned: User;
}

export interface Communication {
  id: number;
  message: string;
  date: string;
  type: string;
  notes: string;
  lead: Lead;
}
