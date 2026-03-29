import type { Warehouse, WarehouseStatus } from './types'

/** Prefer API warehouseCode; fallback to synthetic id-based label. */
export function displayWarehouseCode(w: { id: number; warehouseCode: string | null }): string {
  const c = w.warehouseCode?.trim()
  if (c) return c
  return `WH-${String(w.id).padStart(5, '0')}`
}

/** Short label for selects and tables: code + name. */
export function warehouseLabel(w: Warehouse): string {
  return `${displayWarehouseCode(w)} — ${w.name}`
}

/** Format m² with thousands separators. */
export function formatM2(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return `${value.toLocaleString('en-US')} m²`
}

/** Display helper for nullable string fields from the API. */
export function formatWarehouseContact(value: string | null | undefined): string {
  if (value === null || value === undefined || value.trim() === '') return '—'
  return value
}

/** Occupancy 0–100 from max/occupied m², or null if not computable. */
export function occupancyPercent(w: Warehouse): number | null {
  const max = w.maxCapacityM2
  const occ = w.occupiedM2
  if (max === null || max === undefined || max <= 0) return null
  if (occ === null || occ === undefined) return null
  return Math.min(100, Math.max(0, (occ / max) * 100))
}

export function formatPercent(value: number | null | undefined, fractionDigits = 1): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return `${value.toFixed(fractionDigits)}%`
}

const STATUS_LABELS: Record<WarehouseStatus, string> = {
  ACTIVE: 'Active',
  FULL: 'Full',
  MAINTENANCE: 'Maintenance',
}

export function warehouseStatusLabel(status: WarehouseStatus): string {
  return STATUS_LABELS[status] ?? status
}

/** Progress bar tone from occupancy (0–100). */
export function occupancyTone(percent: number): 'low' | 'mid' | 'high' {
  if (percent >= 90) return 'high'
  if (percent >= 70) return 'mid'
  return 'low'
}
