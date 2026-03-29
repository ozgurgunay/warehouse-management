import type { StockStatusLabel } from './types'

export function formatMoneyUsd(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

export function formatCompactNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return n.toLocaleString('en-US')
}

export function stockStatusDisplay(status: StockStatusLabel): { label: string; tone: 'ok' | 'warn' | 'bad' } {
  switch (status) {
    case 'IN_STOCK':
      return { label: 'IN STOCK', tone: 'ok' }
    case 'LOW_STOCK':
      return { label: 'LOW STOCK', tone: 'warn' }
    case 'OUT_OF_STOCK':
      return { label: 'OUT OF STOCK', tone: 'bad' }
    default:
      return { label: status, tone: 'ok' }
  }
}

export function categoryBadgeClass(name: string | null | undefined): string {
  if (!name) return 'pc-badge pc-badge--slate'
  const h = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const palette = ['pc-badge--blue', 'pc-badge--teal', 'pc-badge--amber', 'pc-badge--violet'] as const
  return `pc-badge ${palette[h % palette.length]}`
}
