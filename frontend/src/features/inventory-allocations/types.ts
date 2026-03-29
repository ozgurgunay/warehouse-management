export type AllocationStatus = 'ACTIVE' | 'RELEASED' | 'USED' | 'EXPIRED'

export type InventoryAllocationDto = {
  id: number
  inventoryId: number
  orderId: number
  orderItemId: number | null
  productId: number
  productSku: string | null
  productName: string | null
  warehouseId: number
  warehouseCode: string | null
  warehouseName: string | null
  storageLocationId: number | null
  storageLocationLabel: string | null
  allocatedQuantity: number
  expirationTime: string | null
  status: AllocationStatus
  createdAt: string | null
  updatedAt: string | null
}

export type InventoryAllocationPage = {
  content: InventoryAllocationDto[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export type AllocateStockPayload = {
  orderId: number
  productId: number
  quantity: number
}
