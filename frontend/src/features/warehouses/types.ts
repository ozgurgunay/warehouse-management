/** Mirrors backend WarehouseStatus enum. */
export type WarehouseStatus = 'ACTIVE' | 'FULL' | 'MAINTENANCE'

/** Mirrors backend WarehouseDTO. */
export type Warehouse = {
  id: number
  warehouseCode: string | null
  name: string
  location: string
  region: string | null
  status: WarehouseStatus
  maxCapacityM2: number | null
  occupiedM2: number | null
  contactNumber: string | null
}

/** Body for POST /warehouses and PUT /warehouses/{id}. */
export type WarehouseWritePayload = {
  warehouseCode: string | null
  name: string
  location: string
  region: string | null
  status: WarehouseStatus
  maxCapacityM2: number | null
  occupiedM2: number | null
  contactNumber: string | null
}

/** Mirrors backend WarehouseStatsDTO. */
export type WarehouseStats = {
  totalWarehouses: number
  averageOccupancyPercent: number
  totalCapacityM2Sum: number
}
