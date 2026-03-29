import type { WarehouseStatus, WarehouseWritePayload } from './types'

export type WarehouseFormDraft = {
  warehouseCode: string
  name: string
  location: string
  region: string
  status: WarehouseStatus
  maxCapacityM2Input: string
  occupiedM2Input: string
  contactNumber: string
}

const STATUSES: WarehouseStatus[] = ['ACTIVE', 'FULL', 'MAINTENANCE']

export function isWarehouseStatus(value: string): value is WarehouseStatus {
  return STATUSES.includes(value as WarehouseStatus)
}

export function emptyWarehouseDraft(): WarehouseFormDraft {
  return {
    warehouseCode: '',
    name: '',
    location: '',
    region: '',
    status: 'ACTIVE',
    maxCapacityM2Input: '',
    occupiedM2Input: '',
    contactNumber: '',
  }
}

export function draftFromWarehouse(w: {
  warehouseCode: string | null
  name: string
  location: string
  region: string | null
  status: WarehouseStatus
  maxCapacityM2: number | null
  occupiedM2: number | null
  contactNumber: string | null
}): WarehouseFormDraft {
  return {
    warehouseCode: w.warehouseCode ?? '',
    name: w.name,
    location: w.location,
    region: w.region ?? '',
    status: w.status,
    maxCapacityM2Input:
      w.maxCapacityM2 === null || w.maxCapacityM2 === undefined
        ? ''
        : String(w.maxCapacityM2),
    occupiedM2Input:
      w.occupiedM2 === null || w.occupiedM2 === undefined ? '' : String(w.occupiedM2),
    contactNumber: w.contactNumber ?? '',
  }
}

function parseOptionalLong(raw: string, fieldLabel: string): number | null {
  const t = raw.trim()
  if (t.length === 0) return null
  const n = Number.parseInt(t, 10)
  if (!Number.isFinite(n) || n < 0) {
    throw new Error(`${fieldLabel} must be a non-negative whole number.`)
  }
  return n
}

/**
 * Builds API payload from form draft. Throws a plain Error with a user-facing message if invalid.
 */
export function payloadFromDraft(draft: WarehouseFormDraft): WarehouseWritePayload {
  const name = draft.name.trim()
  const location = draft.location.trim()
  if (!name) {
    throw new Error('Name is required.')
  }
  if (!location) {
    throw new Error('Location is required.')
  }

  const warehouseCodeTrim = draft.warehouseCode.trim()
  const warehouseCode = warehouseCodeTrim.length === 0 ? null : warehouseCodeTrim

  const regionTrim = draft.region.trim()
  const region = regionTrim.length === 0 ? null : regionTrim

  const maxCapacityM2 = parseOptionalLong(draft.maxCapacityM2Input, 'Maximum capacity (m²)')
  const occupiedM2 = parseOptionalLong(draft.occupiedM2Input, 'Occupied area (m²)')

  if (maxCapacityM2 !== null && occupiedM2 !== null && occupiedM2 > maxCapacityM2) {
    throw new Error('Occupied area cannot exceed maximum capacity.')
  }

  const contactTrim = draft.contactNumber.trim()
  const contactNumber = contactTrim.length === 0 ? null : contactTrim

  return {
    warehouseCode,
    name,
    location,
    region,
    status: draft.status,
    maxCapacityM2,
    occupiedM2,
    contactNumber,
  }
}
