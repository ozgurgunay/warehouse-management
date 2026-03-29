export type StockStatusLabel = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'

export type ProductCatalogRow = {
  id: number
  name: string
  sku: string
  price: number | null
  description: string | null
  categoryId: number | null
  categoryName: string | null
  totalAvailableUnits: number
  stockStatus: StockStatusLabel
  lowStockThreshold: number | null
  createdBy: string
  updatedBy: string
  createdAt: string | null
  updatedAt: string | null
  barcodeId: number | null
  qrCodeId: number | null
  primaryLocationLabel: string | null
}

export type ProductCatalogPage = {
  content: ProductCatalogRow[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export type ProductStats = {
  totalSku: number
  averageUnitPrice: number
  totalInventoryValue: number
  lowStockSkuCount: number
  recentlyUpdatedCount: number
}

export type ProductStockDistribution = {
  warehouseId: number
  facilityName: string
  locationBfs: string
  availableUnits: number
  rowStatus: StockStatusLabel
}

export type ProductMovementHistory = {
  id: number
  movementType: string
  reason: string | null
  quantityChange: number
  movementDate: string | null
  warehouseName: string
  createdBy: string
}

/** Mirrors backend ProductDTO for create/update. */
export type ProductDto = {
  id?: number
  name: string
  sku: string
  price: number | null
  description: string | null
  categoryId: number | null
  categoryName?: string | null
  manufacturer: string | null
  dimensionsText: string | null
  weightKg: number | null
  material: string | null
  operatingTempRange: string | null
  ipRating: string | null
  imageUrl: string | null
  lowStockThreshold: number | null
  createdBy: string
  updatedBy: string
  createdAt?: string | null
  updatedAt?: string | null
  barcodeId?: number | null
  qrCodeId?: number | null
}

export type ProductDetail = {
  id: number
  name: string
  sku: string
  price: number | null
  description: string | null
  categoryId: number | null
  categoryName: string | null
  manufacturer: string | null
  dimensionsText: string | null
  weightKg: number | null
  material: string | null
  operatingTempRange: string | null
  ipRating: string | null
  imageUrl: string | null
  lowStockThreshold: number | null
  createdBy: string
  updatedBy: string
  createdAt: string | null
  updatedAt: string | null
  barcodeId: number | null
  barcodeCode: string | null
  qrCodeId: number | null
  qrCodeValue: string | null
  stockStatus: StockStatusLabel
  totalAvailableUnits: number
  stockDistribution: ProductStockDistribution[]
  movementHistory: ProductMovementHistory[]
}
