export interface Consumible {
  id?: string;
  name: string;
  brand?: string;
  price: number;
  currency?: string;
  sku?: string;
  longDescription: string;
  shortDescription: string;
  compatibleModels?: string[];
  color?: string;
  yield?: number;
  img_url: string[];
  category: string;
  // printers?: Printer[];
  orderDetails?: OrderDetail[];
  counterpart?: Consumible;

  //delete later
  stock?: number;
  weight?: number;
  location?: string;
}

export interface OrderDetail {
  // Define the properties of OrderDetail based on its structure in your application
}
