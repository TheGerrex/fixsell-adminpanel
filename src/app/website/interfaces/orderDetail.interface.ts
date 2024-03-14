import { Consumible } from "./consumibles.interface";
import { Order } from "./order.interface";

export interface OrderDetail {
    id: string;
    order: Order;
    consumible: Consumible;
    name: string;
    price: number;
    quantity: number;
}