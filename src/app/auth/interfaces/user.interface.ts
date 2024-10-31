import { Lead } from 'src/app/sales/interfaces/leads.interface';

export interface User {
  id?: string;
  name?: string;
  email?: string;
  password?: string;
  isActive?: boolean;
  role?: Role;
  leads?: Lead[];
}

export interface Role {
  id?: string;
  name?: string;
  permission?: Permission;
}

export interface Permission {
  id?: string;
  name?: string;
  canCreatePrinter?: boolean;
  canDeletePrinter?: boolean;
  canUpdatePrinter?: boolean;
  canViewPrinter?: boolean;
  canCreateConsumable?: boolean;
  canDeleteConsumable?: boolean;
  canUpdateConsumable?: boolean;
  canViewConsumable?: boolean;
  canCreateDeal?: boolean;
  canDeleteDeal?: boolean;
  canUpdateDeal?: boolean;
  canViewDeal?: boolean;
  canCreatePackage?: boolean;
  canDeletePackage?: boolean;
  canUpdatePackage?: boolean;
  canViewPackage?: boolean;
  canCreateLead?: boolean;
  canDeleteLead?: boolean;
  canUpdateLead?: boolean;
  canViewLead?: boolean;
  canCreateUser?: boolean;
  canDeleteUser?: boolean;
  canUpdateUser?: boolean;
  canViewUser?: boolean;
  canCreateTicket?: boolean;
  canDeleteTicket?: boolean;
  canUpdateTicket?: boolean;
  canViewTicket?: boolean;
  canManageUserConfig?: boolean;
  canCreateChat?: boolean;
  canDeleteChat?: boolean;
  canUpdateChat?: boolean;
  canViewChat?: boolean;
}
