import { Printer } from 'src/app/website/interfaces/printer.interface';
import { User } from 'src/app/users/interfaces/users.interface';
import { TaxRegime } from 'src/app/shared/services/tax-regime.service';

// Enums to match backend
export enum PaymentMethod {
  CASH = '01',
  CHECK = '02',
  ELECTRONIC_TRANSFER = '03',
  CREDIT_CARD = '04',
  ELECTRONIC_WALLET = '05',
  ELECTRONIC_MONEY = '12',
  DEBIT_CARD = '28',
  VIRTUAL_STORE = '29',
  COMPENSATION = '17',
  TO_BE_DEFINED = '99',
}

export enum ClientPrinterPurchaseStatus {
  RENTED = 'rented',
  PURCHASED = 'purchased',
}

export enum Currency {
  MXN = 'pesos',
  USD = 'dolares',
}

export enum DayOfWeek {
  MONDAY = 'Lunes',
  TUESDAY = 'Martes',
  WEDNESDAY = 'Miércoles',
  THURSDAY = 'Jueves',
  FRIDAY = 'Viernes',
  SATURDAY = 'Sábado',
  SUNDAY = 'Domingo',
}

export type CfdiAllowedValues = string;

// Payment complement information for bank accounts
export interface PaymentComplementInfo {
  id: string;
  clientAccountId: string;
  senderTaxId: string;
  senderBank: string;
  senderAccountNumber: string;
  recipientTaxId: string;
  recipientAccountNumber: string;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Client bank account
export interface ClientAccount {
  id: string;
  clientId: string;
  accountName: string;
  accountNumber: string;
  clabe?: string;
  bankName?: string;
  paymentMethod: PaymentMethod;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  paymentComplementInfo: PaymentComplementInfo[];
}

// Client printer information
export interface ClientPrinter {
  id: string;
  clientId: string;
  printerId: string;
  macAddress?: string;
  serialNumber?: string;
  purchaseStatus?: ClientPrinterPurchaseStatus;
  smtpServer?: string;
  smtpPort?: number;
  smtpSecurity?: string;
  smtpEmail?: string;
  smtpPassword?: string;
  devicePassword?: string;
  billingDay?: string;
  ip?: string;
  location?: string;
  printer: Printer;
}

// Client contact
export interface ClientContact {
  id: string;
  clientId: string;
  name: string;
  officePhone?: string;
  homePhone?: string | null;
  mobilePhone?: string;
  email?: string;
  contactType?: string;
  description?: string;
  billingBranch?: string;
  birthday?: string | Date;
  observations?: string;
  isActive: boolean;
  isDefault: boolean;
  isBillingContact: boolean;
  isPaymentComplementContact: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Shipping address
export interface ShippingAddress {
  id: string;
  clientId: string;
  alias: string;
  neighborhood: string;
  state: string;
  streetAndNumber: string;
  municipality: string;
  postalCode: number;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Billing address
export interface BillingAddress {
  id: string;
  clientId: string;
  alias: string;
  neighborhood: string;
  state: string;
  streetAndNumber: string;
  municipality: string;
  postalCode: number;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Suspension configuration
export interface SuspensionConfig {
  id: string;
  clientId: string;
  validateByDueDate: boolean;
  suspendForServiceAndParts: boolean;
  suspendForSalesDocuments: boolean;
  graceDays: number;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Base classification
export interface BaseClassification {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface BusinessGroup extends BaseClassification { }
export interface CollectionZone extends BaseClassification { }
export interface ClientCategory extends BaseClassification { }
export interface BusinessLine extends BaseClassification { }
export interface BranchOffice extends BaseClassification { }

// Commercial conditions
export interface CommercialConditions {
  id: string;
  clientId: string;
  assignedExecutiveId: string | null;
  creditDays: number;
  collectionExecutiveId: string | null;
  creditLimit: string | number;
  isActiveClient: boolean;
  applyVatWithholding: boolean;
  validateCreditLimitInSales: boolean;
  collectionObservations?: string;
  currency: Currency;
  reviewDays: DayOfWeek[];
  paymentDays: DayOfWeek[];
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  assignedExecutive?: User;
  collectionExecutive?: User;
}

// Client classifications
export interface ClientClassifications {
  id: string;
  clientId: string;
  businessGroupId?: string | null;
  collectionZoneId?: string | null;
  clientCategoryId?: string | null;
  businessLineId?: string | null;
  branchOfficeId?: string | null;

  // Optional relations
  businessGroup?: BusinessGroup;
  collectionZone?: CollectionZone;
  clientCategory?: ClientCategory;
  businessLine?: BusinessLine;
  branchOffice?: BranchOffice;
}

// Main client interface
export interface Client {
  id: string;
  businessName: string;
  commercialName?: string;
  rfc: string;
  street: string;
  exteriorNumber: string;
  interiorNumber?: string;
  neighborhood: string;
  cfdiUse: CfdiAllowedValues;
  isrRetention: boolean;
  locality: string;
  municipality: string;
  state: string;
  country: string;
  postalCode: string;
  reference?: string;
  legalRepresentative: string;
  taxRegime: TaxRegime;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;

  // Related entities
  accounts?: ClientAccount[];
  clientPrinters?: ClientPrinter[];
  contacts?: ClientContact[];
  shippingAddresses?: ShippingAddress[];
  billingAddresses?: BillingAddress[];
  suspensionConfig?: SuspensionConfig;
  commercialConditions?: CommercialConditions;
  classifications?: ClientClassifications;
}
