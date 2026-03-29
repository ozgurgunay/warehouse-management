export function displayLocationCode(loc: { id: number; locationCode: string | null }): string {
  const c = loc.locationCode?.trim()
  if (c) return c
  return `L-${String(loc.id).padStart(5, '0')}`
}

export function formatNullable(value: string | null | undefined): string {
  if (value === null || value === undefined || value.trim() === '') return '—'
  return value
}
