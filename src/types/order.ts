export interface CheckoutData {
  shippingAddress: any;
  paymentMethod: 'COD' | 'ONLINE';
  paymentStatus?: 'PENDING' | 'PAID' | 'COD';
  transactionId?: string | null;
}
