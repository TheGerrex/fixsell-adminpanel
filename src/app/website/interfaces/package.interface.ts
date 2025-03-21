import { Printer } from './printer.interface';

export interface Package {
  id: number;
  printer: Printer;
  packageDuration: number;
  packageMonthlyPrice: string; // Changed from packagePrice
  packageCurrency: string;
  packageEndDate: Date;
  packageStartDate: Date;
  packageDiscountPercentage: string | number;
  packageDescription: string;
  packagePrintsBw: number; // Changed from packagePrints
  packagePrintsColor: number | null;
  packageExtraClickPriceBw: string | number; // Changed from packageExtraClickPrice
  packageExtraClickPriceColor: string | number | null;
  packageDepositPrice: string | number;
  packageIncludes: string[];
}
