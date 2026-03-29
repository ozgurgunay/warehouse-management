import type { OrderStatus } from './types'

export function formatOrderDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    return d.toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

/** e.g. Oct 30, 2:22 PM — matches sales table mock */
export function formatOrderDateCompact(iso: string | null | undefined): string {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  } catch {
    return '—'
  }
}

export function formatOrderRef(id: number): string {
  return `SO-${String(id).padStart(4, '0')}`
}

export function formatMoneyUsd(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

export function orderStatusLabel(status: string): string {
  return status.replace(/_/g, ' ')
}

/** Table labels aligned with sales ops vocabulary (mock: PICKING / PACKED / …). */
export function tableStatusLabel(status: string): string {
  switch (status) {
    case 'PACKING':
      return 'PICKING'
    case 'APPROVED':
      return 'PACKED'
    case 'PENDING':
      return 'PENDING'
    case 'SHIPPED':
      return 'SHIPPED'
    case 'DELIVERED':
      return 'DELIVERED'
    case 'CANCELLED':
      return 'CANCELLED'
    case 'RETURNED':
      return 'RETURNED'
    default:
      return orderStatusLabel(status)
  }
}

export function orderStatusBadgeClass(status: string): string {
  const base = 'ds-badge ord-badge'
  switch (status) {
    case 'PENDING':
      return `${base} ord-badge--pending`
    case 'APPROVED':
      return `${base} ord-badge--packed`
    case 'PACKING':
      return `${base} ord-badge--picking`
    case 'SHIPPED':
      return `${base} ord-badge--shipped`
    case 'DELIVERED':
      return `${base} ord-badge--delivered`
    case 'CANCELLED':
    case 'RETURNED':
      return `${base} ds-badge--danger`
    default:
      return `${base}`
  }
}

export type PriorityTone = 'urgent' | 'high' | 'normal'

export function derivePriority(status: string): { label: string; tone: PriorityTone } {
  switch (status) {
    case 'PENDING':
      return { label: 'URGENT', tone: 'urgent' }
    case 'APPROVED':
    case 'PACKING':
      return { label: 'HIGH', tone: 'high' }
    case 'SHIPPED':
      return { label: 'NORMAL', tone: 'normal' }
    case 'DELIVERED':
      return { label: 'NORMAL', tone: 'normal' }
    case 'CANCELLED':
    case 'RETURNED':
      return { label: 'LOW', tone: 'normal' }
    default:
      return { label: 'NORMAL', tone: 'normal' }
  }
}

/** Second line under customer name — shipping context (no ship method on DTO). */
export function customerShippingSubline(address: string | null | undefined): string {
  const t = address?.trim()
  if (!t) return 'Shipping address on file'
  const line = t.split(/\r?\n/)[0]?.trim() ?? t
  return line.length > 52 ? `${line.slice(0, 49)}…` : line
}

export const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'PACKING', label: 'Packing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'RETURNED', label: 'Returned' },
]
