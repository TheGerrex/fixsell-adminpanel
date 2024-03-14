import { Printer } from "./printer.interface";


export interface Package {
    id: number;
    printer: Printer;
    packageDuration: number;
    packagePrice: number;
    packageCurrency: string;
    packageEndDate: Date;
    packageStartDate: Date;
    packageDiscountPercentage: number;
    packageDescription: string;
    packagePrints: number;
    packageExtraClickPrice: number;
    packageDepositPrice: number;
    packageIncludes: string[];
}