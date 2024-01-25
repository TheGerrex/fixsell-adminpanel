export interface Consumible {
  id: string;
  name: string;
  price: number;
  weight: number;
  longDescription: string;
  shortDescription: string;
  thumbnailImage: string;
  images: string[];
  category: string;
  stock: number;
  location: string;
  // orderDetails: OrderDetail[];
}

export interface OrderDetail {
  // Define the properties of OrderDetail based on its structure in your application
}
