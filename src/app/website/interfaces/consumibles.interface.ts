import { Printer } from './printer.interface';
export interface Consumible {
  id?: string;
  name: string;
  price: number;
  weight: number;
  longDescription: string;
  shortDescription: string;
  thumbnailImage: string;
  images: string[];
  category: string;
  printers?: Printer[];
  orderDetails?: OrderDetail[];
  counterpart?: Consumible;
  origen?: string;
  volume?: number;

  //delete later
  stock?: number;
  weight?: number;
  location?: string;
}

export interface OrderDetail {
  // Define the properties of OrderDetail based on its structure in your application
}
