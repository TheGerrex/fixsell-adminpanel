import { Deal } from './deal.interface';
import { OrderDetail } from './orderDetail.interface';
import { Printer } from './printer.interface';

export interface Consumible {
    id: string;
    name: string;
    brand?: string;
    price: number;
    currency: string;
    sku: string;
    origen: string;
    volume: number;
    longDescription: string;
    shortDescription: string;
    compatibleModels: string[];
    color: string;
    yield: number;
    img_url: string[];
    category: string;
    printers: Printer[];
    orderDetails: OrderDetail[];
    counterparts: Consumible[];
    counterpart: Consumible;
    deals: Deal[];
}
