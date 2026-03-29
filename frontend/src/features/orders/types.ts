export type OrderStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'PACKING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED'

export type PaymentStatus = 'UNPAID' | 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED'

export type ShipmentStatus =
  | 'PENDING'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'RETURNED'
  | 'CANCELLED'

export type OrderItemDto = {
  id: number
  orderId: number
  productId: number
  quantity: number
  unitPrice: number | null
  totalPrice: number | null
  batchNo: string | null
  barcode: string | null
  qrCode: string | null
}

export type OrderDto = {
  id: number
  customerId: number
  orderDate: string | null
  status: string
  paymentStatus: string | null
  totalAmount: number | null
  shippingAddress: string | null
  billingAddress: string | null
  items: OrderItemDto[] | null
  shipmentStatus: string | null
  expectedDeliveryDate: string | null
  actualDeliveryDate: string | null
}
