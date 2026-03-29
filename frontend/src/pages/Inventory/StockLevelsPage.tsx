import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { getInventoryLines } from '../../features/inventory/api'
import type { InventoryLine, InventoryStatus } from '../../features/inventory/types'
import { displayWarehouseCode } from '../../features/warehouses/format'
import { useWarehouses } from '../../features/warehouses/hooks/useWarehouses'
import { isAbortError, type ApiError } from '../../services/apiClient'

import './stockLevelsPage.css'

const PAGE_SIZE = 12
const FETCH_SIZE = 3000

const STATUS_OPTIONS: { value: '' | InventoryStatus; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'RESERVED', label: 'Reserved' },
  { value: 'QUARANTINE', label: 'Quarantine' },
  { value: 'DAMAGED', label: 'Damaged' },
  { value: 'MISSING', label: 'Missing' },
  { value: 'EXPIRED', label: 'Expired' },
]

function statusPillClass(s: InventoryStatus | null | undefined): string {
  switch (s) {
    case 'AVAILABLE':
      return 'sl-status-pill sl-status--available'
    case 'RESERVED':
      return 'sl-status-pill sl-status--reserved'
    case 'QUARANTINE':
      return 'sl-status-pill sl-status--quarantine'
    case 'DAMAGED':
    case 'MISSING':
    case 'EXPIRED':
      return 'sl-status-pill sl-status--damaged'
    default:
      return 'sl-status-pill sl-status--quarantine'
  }
}

export function StockLevelsPage() {
  const { data: warehouses } = useWarehouses()

  const [lines, setLines] = useState<InventoryLine[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [reloadTick, setReloadTick] = useState(0)

  const [search, setSearch] = useState('')
  const [warehouseId, setWarehouseId] = useState<number | null>(null)
  const [status, setStatus] = useState<'' | InventoryStatus>('')
  const [page, setPage] = useState(1)

  const refresh = useCallback(() => setReloadTick((x) => x + 1), [])

  useEffect(() => {
    let isCurrent = true
    const ac = new AbortController()
    setLoading(true)
    setLoadError(null)
    getInventoryLines(
      {
        page: 0,
        size: FETCH_SIZE,
        warehouseId: warehouseId ?? undefined,
        status: status || undefined,
      },
      ac.signal,
    )
      .then((data) => {
        if (!isCurrent) return
        setLines(data)
      })
      .catch((e) => {
        if (!isCurrent) return
        if (isAbortError(e)) return
        setLoadError((e as ApiError).message)
        setLines(null)
      })
      .finally(() => {
        if (isCurrent) setLoading(false)
      })
    return () => {
      isCurrent = false
      ac.abort()
    }
  }, [reloadTick, warehouseId, status])

  const filtered = useMemo(() => {
    if (!lines) return []
    const q = search.trim().toLowerCase()
    if (!q) return lines
    return lines.filter((row) => {
      const hay = `${row.productSku ?? ''} ${row.productName ?? ''}`.toLowerCase()
      return hay.includes(q)
    })
  }, [lines, search])

  useEffect(() => {
    setPage(1)
  }, [search, warehouseId, status, lines?.length])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const paged = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, safePage])

  useEffect(() => {
    if (page !== safePage) setPage(safePage)
  }, [page, safePage])

  const stats = useMemo(() => {
    if (!filtered.length) {
      return { lines: 0, physical: 0, available: 0 }
    }
    let physical = 0
    let available = 0
    for (const r of filtered) {
      physical += r.quantity
      available += r.availableQuantity ?? 0
    }
    return { lines: filtered.length, physical, available }
  }, [filtered])

  const showingFrom = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const showingTo = Math.min(filtered.length, safePage * PAGE_SIZE)

  return (
    <div className="ds-page">
      <nav className="ds-breadcrumb" aria-label="Breadcrumb">
        <span>Inventory</span>
        <span className="ds-breadcrumb-sep">/</span>
        <span>Stock levels</span>
      </nav>

      <div className="ds-page-header">
        <div>
          <h1 className="ds-page-title">STOCK LEVELS</h1>
          <p className="sl-subtitle">
            On-hand physical stock by product, warehouse, and bin. Use this to see where quantity sits—product
            master data and catalog KPIs stay on the Products page.
          </p>
        </div>
        <button type="button" className="ds-btn-ghost" onClick={refresh}>
          Refresh
        </button>
      </div>

      <div className="ds-stat-grid">
        <div className="ds-stat-card">
          <div className="ds-stat-card-header">
            <div>
              <div className="ds-stat-label">Stock lines</div>
              <div className="ds-stat-value">{loading ? '…' : stats.lines.toLocaleString('en-US')}</div>
              <div className="ds-stat-sub">After filters (loaded up to {FETCH_SIZE.toLocaleString('en-US')} rows)</div>
            </div>
          </div>
        </div>
        <div className="ds-stat-card">
          <div className="ds-stat-card-header">
            <div>
              <div className="ds-stat-label">Physical units</div>
              <div className="ds-stat-value">{loading ? '…' : stats.physical.toLocaleString('en-US')}</div>
              <div className="ds-stat-sub">Sum of on-shelf quantity</div>
            </div>
          </div>
        </div>
        <div className="ds-stat-card">
          <div className="ds-stat-card-header">
            <div>
              <div className="ds-stat-label">Available units</div>
              <div className="ds-stat-value">{loading ? '…' : stats.available.toLocaleString('en-US')}</div>
              <div className="ds-stat-sub">Physical minus allocated</div>
            </div>
          </div>
        </div>
      </div>

      <div className="ds-toolbar">
        <div className="ds-search-wrap">
          <span className="ds-search-icon" aria-hidden>
            🔍
          </span>
          <input
            type="search"
            className="ds-search-input"
            placeholder="Search SKU or product name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search stock lines"
          />
        </div>
        <select
          className="ds-filter-select"
          aria-label="Warehouse"
          value={warehouseId ?? ''}
          onChange={(e) => {
            const v = e.target.value
            setWarehouseId(v === '' ? null : Number(v))
          }}
        >
          <option value="">All warehouses</option>
          {(warehouses ?? []).map((w) => (
            <option key={w.id} value={w.id}>
              {displayWarehouseCode(w)} — {w.name}
            </option>
          ))}
        </select>
        <select
          className="ds-filter-select"
          aria-label="Inventory status"
          value={status}
          onChange={(e) => setStatus(e.target.value as '' | InventoryStatus)}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value || 'all'} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <p className="sl-related-strip">
        Related:{' '}
        <Link to="/products">Product catalog</Link>
        {' · '}
        <Link to="/warehouses">Warehouses</Link>
        {' · '}
        <Link to="/storage-locations">Storage locations</Link>
        {' · '}
        <Link to="/stock-movements">Stock movements</Link>
      </p>

      {loading ? (
        <p className="app-muted" style={{ marginTop: 12 }}>
          Loading stock lines…
        </p>
      ) : loadError ? (
        <div style={{ marginTop: 12 }}>
          <p style={{ color: '#dc2626', fontWeight: 900 }}>Failed to load: {loadError}</p>
          <button type="button" className="ds-btn-primary" onClick={refresh}>
            Try again
          </button>
        </div>
      ) : !lines || lines.length === 0 ? (
        <p style={{ marginTop: 12, fontWeight: 800 }}>No inventory rows match your filters.</p>
      ) : filtered.length === 0 ? (
        <p className="app-muted" style={{ marginTop: 12 }}>
          No rows match your search.
        </p>
      ) : (
        <>
          <div className="ds-table-wrap">
            <table className="ds-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product</th>
                  <th>Warehouse</th>
                  <th>Location</th>
                  <th>Physical</th>
                  <th>Allocated</th>
                  <th>Available</th>
                  <th>Status</th>
                  <th>Batch</th>
                  <th>Expiry</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((row) => (
                  <tr key={row.id}>
                    <td className="sl-sku-cell">{row.productSku ?? '—'}</td>
                    <td>
                      <div className="ds-name-block">
                        <div className="ds-name-main">{row.productName ?? '—'}</div>
                      </div>
                    </td>
                    <td>
                      <div className="ds-name-block">
                        <div className="ds-name-main">{row.warehouseCode ?? row.warehouseName ?? '—'}</div>
                        {row.warehouseName ? (
                          <span className="ds-link-sub" style={{ color: 'rgba(15,23,42,0.45)' }}>
                            {row.warehouseName}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td>{row.storageLocationLabel ?? '—'}</td>
                    <td className="sl-num">{row.quantity}</td>
                    <td className="sl-num">{row.quantityAllocated ?? 0}</td>
                    <td className="sl-num">{row.availableQuantity ?? 0}</td>
                    <td>
                      <span className={statusPillClass(row.status)}>{row.status ?? '—'}</span>
                    </td>
                    <td>{row.batchNumber ?? '—'}</td>
                    <td>
                      {row.expiryDate
                        ? new Date(row.expiryDate).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="ds-pagination">
            <div className="ds-pagination-summary">
              Showing {showingFrom}-{showingTo} of {filtered.length} lines
            </div>
            <div className="ds-pagination-buttons">
              <button
                type="button"
                className="ds-page-btn"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </button>
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`ds-page-btn ${n === safePage ? 'ds-page-btn--active' : ''}`}
                  onClick={() => setPage(n)}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                className="ds-page-btn"
                disabled={safePage >= pageCount}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
