import { Consumible } from './consumibles.interface';

export interface Printer {
  id: string;
  brand: string;
  model: string;
  datasheet_url: string;
  img_url: string[];
  description: string;
  price: number;
  currency: string;
  category: string;
  color: boolean;
  rentable: boolean;
  sellable: boolean;
  tags: string[];
  powerConsumption: string;
  dimensions: string;
  printVelocity: string;
  maxPrintSizeSimple: string;
  maxPrintSize: string;
  printSize: string;
  maxPaperWeight: string;
  duplexUnit: boolean;
  paperSizes: string;
  applicableOS: string;
  printerFunctions: string;
  barcode: null;
  deal: Deal;
  packages: Package[];
  consumibles: Consumible[];
}

export interface Deal {
  id: number;
  dealEndDate: Date;
  dealStartDate: Date;
  dealPrice: string;
  dealCurrency: string;
  dealDiscountPercentage: string;
  dealDescription: string;
  printer: Printer;
}

export interface Package {
  id: number;
  packageDuration: number;
  packagePrice: string;
  packageCurrency: string;
  packageEndDate: Date;
  packageStartDate: Date;
  packageDiscountPercentage: string;
  packageDescription: string;
  packagePrints: number;
  packageExtraClickPrice: string;
  packageDepositPrice: number;
  printer: Printer;
}
