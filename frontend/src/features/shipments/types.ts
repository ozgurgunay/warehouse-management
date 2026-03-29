/** Mirrors backend ShipmentStatus enum. */
export type ShipmentStatus =
  | 'PENDING'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'RETURNED'
  | 'CANCELLED'

/** Mirrors backend ShippingMethod enum. */
export type ShippingMethod =
  | 'STANDARD_COURIER'
  | 'EXPRESS_COURIER'
  | 'CARGO_TRUCK'
  | 'PICKUP_AT_STORE'
  | 'PICKUP_AT_WAREHOUSE'
  | 'IN_HOUSE_DELIVERY'
  | 'LOCKER'
  | 'DRONE_DELIVERY'
  | 'BIKE_COURIER'
  | 'INTERNATIONAL'
  | 'CUSTOM'

export type ShipmentDto = {
  id: number
  orderId: number | null
  orderDate: string | null
  customerName: string | null
  status: string
  carrier: string | null
  trackingNumber: string | null
  shippedDate: string | null
  deliveredDate: string | null
  shippingAddress: string | null
  /** Promised / ETA window for carrier planning */
  estimatedArrivalDate: string | null
  shipmentCost: number | null
  shippingMethod: ShippingMethod | null
  shippingMethodDescription: string | null
  barcode: string | null
  qrCode: string | null
}

export type ShipmentPage = {
  content: ShipmentDto[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export type MarkShippedPayload = {
  carrier: string
  trackingNumber?: string | null
  shippedAt: string
}

export type DeliverShipmentPayload = {
  receiverName: string
  receiverPhone: string
  deliveryNote?: string | null
  deliveredAt: string
}
