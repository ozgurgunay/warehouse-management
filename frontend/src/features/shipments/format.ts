import type { ShippingMethod } from './types'

const METHOD_LABELS: Record<ShippingMethod, string> = {
  STANDARD_COURIER: 'Standard courier',
  EXPRESS_COURIER: 'Express courier',
  CARGO_TRUCK: 'Cargo / truck',
  PICKUP_AT_STORE: 'Pickup at store',
  PICKUP_AT_WAREHOUSE: 'Pickup at warehouse',
  IN_HOUSE_DELIVERY: 'In-house delivery',
  LOCKER: 'Locker',
  DRONE_DELIVERY: 'Drone',
  BIKE_COURIER: 'Bike courier',
  INTERNATIONAL: 'International',
  CUSTOM: 'Custom',
}

export function formatShippingMethod(m: ShippingMethod | string | null | undefined): string {
  if (!m) return '—'
  return METHOD_LABELS[m as ShippingMethod] ?? String(m)
}

export function shipmentStatusLabel(s: string): string {
  return s.replace(/_/g, ' ')
}
