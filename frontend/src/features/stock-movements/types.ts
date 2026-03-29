export type MovementType = 'INBOUND' | 'OUTBOUND' | 'TRANSFER'

export type StockMovementDto = {
  id: number
  movementType: MovementType
  reason: string | null
  quantityChange: number
  movementDate: string | null
  productId: number
  warehouseId: number
  productSku: string | null
  productName: string | null
  warehouseCode: string | null
  warehouseName: string | null
  createdBy: string
  updatedBy: string
}

export type StockMovementPage = {
  content: StockMovementDto[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export type CreateStockMovementPayload = {
  movementType: MovementType
  reason?: string | null
  quantityChange: number
  productId: number
  warehouseId: number
  createdBy: string
  updatedBy: string
}
