import { Consumible } from './consumibles.interface';
import { Printer } from './printer.interface';

export interface Deal {
  id: string;
  printer?: Printer;
  consumible?: Consumible;
  dealEndDate: Date;
  dealStartDate: Date;
  dealPrice: number;
  dealCurrency: string;
  dealDiscountPercentage: number;
  dealDescription: string;
  eventId?: string; // Add this field to associate with an event
}
