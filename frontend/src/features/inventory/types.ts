export type InventoryStatus =
  | 'AVAILABLE'
  | 'RESERVED'
  | 'QUARANTINE'
  | 'DAMAGED'
  | 'MISSING'
  | 'EXPIRED'

export type InventoryLine = {
  id: number
  productId: number
  warehouseId: number
  quantity: number
  quantityAllocated: number | null
  availableQuantity: number | null
  batchNumber: string | null
  expiryDate: string | null
  storageLocationId: number | null
  productSku: string | null
  productName: string | null
  warehouseCode: string | null
  warehouseName: string | null
  storageLocationLabel: string | null
  status: InventoryStatus | null
  createdAt: string | null
  updatedAt: string | null
}
