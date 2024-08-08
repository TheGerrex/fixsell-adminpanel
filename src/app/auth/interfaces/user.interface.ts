import { Lead } from "src/app/sales/interfaces/leads.interface";

export interface User {
  id?: string;
  name?: string;
  email?: string;
  password?: string;
  isActive?: boolean;
  roles?: Role[];
  leads?: Lead[];
}

export interface Role {
  id?: string;
  name?: string;
}
