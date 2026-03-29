/** Mirrors backend StorageLocationDTO. */
export type StorageLocation = {
  id: number
  warehouseId: number
  warehouseName: string | null
  locationCode: string | null
  name: string
  building: string | null
  floor: string | null
  section: string | null
  zoneLabel: string | null
}

export type StorageLocationWritePayload = {
  warehouseId: number
  locationCode: string | null
  name: string
  building: string | null
  floor: string | null
  section: string | null
  zoneLabel: string | null
}

export type StorageLocationStats = {
  totalLocations: number
  occupiedBins: number
  emptyBins: number
  occupancyPercent: number
  hotZoneLabel: string
}
