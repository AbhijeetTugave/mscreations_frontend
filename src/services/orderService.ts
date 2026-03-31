import api from '@/lib/api';
import { Order } from './adminService';

export interface CheckoutShippingAddress {
  fullName: string;
  mobile: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
}

export interface CheckoutData {
  shippingAddress: CheckoutShippingAddress;
  paymentMethod: string;
}

export const orderService = {
  checkout: (data: CheckoutData) =>
    api.post<Order>('/orders/checkout', data),

  getOrders: () =>
    api.get<Order[]>('/orders'),

  getOrder: (orderId: string) =>
    api.get<Order>(`/orders/${orderId}`),
};
