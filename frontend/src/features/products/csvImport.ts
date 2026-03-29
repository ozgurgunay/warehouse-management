/**
 * Minimal CSV row parser (supports quoted fields). Header row required.
 * Variables and comments in English.
 */

export type ParsedProductRow = {
  sku: string
  name: string
  price: number
  description: string | null
  categoryId: number | null
  manufacturer: string | null
  dimensionsText: string | null
  weightKg: number | null
  material: string | null
  operatingTempRange: string | null
  ipRating: string | null
  imageUrl: string | null
  lowStockThreshold: number | null
}

function parseCsvLine(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (c === ',' && !inQuotes) {
      out.push(cur)
      cur = ''
    } else {
      cur += c
    }
  }
  out.push(cur)
  return out.map((s) => s.trim())
}

function normHeader(h: string) {
  return h.trim().toLowerCase().replace(/\s+/g, '')
}

export function parseProductImportCsv(text: string): { headers: string[]; rows: ParsedProductRow[]; errors: string[] } {
  const errors: string[] = []
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0)
  if (lines.length < 2) {
    errors.push('CSV must include a header row and at least one data row.')
    return { headers: [], rows: [], errors }
  }
  const headers = parseCsvLine(lines[0]).map(normHeader)
  const idx = (name: string) => headers.indexOf(name)

  const iSku = idx('sku')
  const iName = idx('name')
  const iPrice = idx('price')
  if (iSku < 0 || iName < 0 || iPrice < 0) {
    errors.push('Required columns: sku, name, price')
    return { headers, rows: [], errors }
  }

  const rows: ParsedProductRow[] = []
  for (let r = 1; r < lines.length; r++) {
    const cells = parseCsvLine(lines[r])
    const get = (i: number) => (i >= 0 && i < cells.length ? cells[i] : '') || ''

    const sku = get(iSku).trim()
    const name = get(iName).trim()
    const priceRaw = get(iPrice).trim()
    const price = Number(priceRaw)
    if (!sku || !name) {
      errors.push(`Row ${r + 1}: missing sku or name`)
      continue
    }
    if (!Number.isFinite(price) || price <= 0) {
      errors.push(`Row ${r + 1}: invalid price`)
      continue
    }

    const num = (h: string) => {
      const i = idx(h)
      if (i < 0) return null
      const v = get(i).trim()
      if (!v) return null
      const n = Number(v)
      return Number.isFinite(n) ? n : null
    }
    const str = (h: string) => {
      const i = idx(h)
      if (i < 0) return null
      const v = get(i).trim()
      return v ? v : null
    }
    const cat = num('categoryid')
    const low = num('lowstockthreshold')
    rows.push({
      sku,
      name,
      price,
      description: str('description'),
      categoryId: cat != null ? Math.floor(cat) : null,
      manufacturer: str('manufacturer'),
      dimensionsText: str('dimensionstext') ?? str('dimensions'),
      weightKg: num('weightkg'),
      material: str('material'),
      operatingTempRange: str('operatingtemprange'),
      ipRating: str('iprating'),
      imageUrl: str('imageurl'),
      lowStockThreshold: low != null ? Math.floor(low) : null,
    })
  }

  return { headers, rows, errors }
}
