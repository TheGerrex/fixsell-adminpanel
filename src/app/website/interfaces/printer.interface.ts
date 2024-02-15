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
  packages: Package;
  consumibles: Consumible[];
}

export interface Deal {
  id: number;
  dealEndDate: Date;
  dealStartDate: Date;
  dealPrice: string;
  dealDiscountPercentage: string;
  dealDescription: string;
}

/*
{
        "id": 2,
        "packageDuration": 2,
        "packagePrice": "200",
        "packageEndDate": "2024-03-01T00:00:00.000Z",
        "packageStartDate": "2022-03-01T00:00:00.000Z",
        "packageDiscountPercentage": "10",
        "packageDescription": "This is a package description.",
        "packagePrints": 1000,
        "packageExtraClickPrice": "0.05",
        "packageDepositPrice": null
    }
*/
export interface Package {
  id: number;
  packageDuration: number;
  packagePrice: string;
  packageEndDate: Date;
  packageStartDate: Date;
  packageDiscountPercentage: string;
  packageDescription: string;
  packagePrints: number;
  packageExtraClickPrice: string;
  packageDepositPrice: number;
}
