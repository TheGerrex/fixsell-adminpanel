import { Consumible } from './consumibles.interface';
import { Deal } from './deal.interface';
import { Package } from './package.interface';

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
  printVelocity: number;
  maxPrintSizeSimple: string;
  maxPrintSize: string;
  printSize: string;
  maxPaperWeight: number;
  duplexUnit: boolean;
  paperSizes: string;
  applicableOS: string;
  printerFunctions: string;
  barcode: string[];
  deals: Deal[];
  packages: Package[];
  consumibles: Consumible[];
}
