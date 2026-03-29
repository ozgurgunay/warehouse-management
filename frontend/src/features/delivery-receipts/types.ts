export type DeliveryReceiptDto = {
  id: number
  shipmentId: number | null
  receiverName: string | null
  receiverPhone: string | null
  deliveryNote: string | null
  deliveredAt: string | null
}

export type DeliveryReceiptUpsertPayload = {
  shipmentId?: number | null
  receiverName: string
  receiverPhone: string
  deliveryNote?: string | null
  deliveredAt?: string | null
}
