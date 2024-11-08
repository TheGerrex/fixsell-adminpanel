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
  id: string;
  name: string;
  [key: string]: boolean | string | undefined;
  canCreatePrinter?: boolean;
  canDeletePrinter?: boolean;
  canUpdatePrinter?: boolean;
  canViewPrinter?: boolean;
  canManagePrinterCRUD?: boolean;
  canCreateCategory?: boolean;
  canDeleteCategory?: boolean;
  canUpdateCategory?: boolean;
  canViewCategory?: boolean;
  canCreateBrand?: boolean;
  canDeleteBrand?: boolean;
  canUpdateBrand?: boolean;
  canViewBrand?: boolean;
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
  canViewAllTickets?: boolean;
  canCreateChat?: boolean;
  canDeleteChat?: boolean;
  canUpdateChat?: boolean;
  canViewChat?: boolean;
  canCreateLeadCommunication?: boolean;
  canDeleteLeadCommunication?: boolean;
  canUpdateLeadCommunication?: boolean;
  canViewLeadCommunication?: boolean;
  canConfigureWebsite?: boolean;
  canViewEvents?: boolean;
  canCreateEvent?: boolean;
  canDeleteEvent?: boolean;
  canUpdateEvent?: boolean;
}
