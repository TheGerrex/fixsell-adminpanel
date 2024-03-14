import { OrderDetail } from "./orderDetail.interface";

export interface Order {
    id: string;
    amount: number;
    shippingName: string;
    shippingAddress1: string;
    shippingAddress2: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone: string;
    status: string;
    email: string;
    date: Date;
    shipped: boolean;
    trackingNumber: string;
    orderDetails: OrderDetail[];
}