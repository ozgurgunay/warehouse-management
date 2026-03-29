import type { Category } from './types'

export function formatCategoryCode(id: number): string {
  return `CAT-${String(id).padStart(3, '0')}`
}

const ACCENT_BARS = ['cat-accent--teal', 'cat-accent--amber', 'cat-accent--slate', 'cat-accent--violet'] as const

export function categoryNameAccentClass(id: number): string {
  return ACCENT_BARS[Math.abs(id) % ACCENT_BARS.length]
}

export function categoryCountPillClass(count: number): string {
  if (count === 0) return 'cat-count-pill cat-count-pill--muted'
  if (count < 10) return 'cat-count-pill cat-count-pill--amber'
  if (count < 100) return 'cat-count-pill cat-count-pill--blue'
  return 'cat-count-pill cat-count-pill--teal'
}

export function isCategoryActive(c: Category): boolean {
  return c.status !== 'ARCHIVED'
}
