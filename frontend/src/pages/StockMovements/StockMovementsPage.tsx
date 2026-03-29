import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../../auth/AuthContext'
import { listProducts } from '../../features/products/api'
import type { ProductDto } from '../../features/products/types'
import { getStockMovementsPage } from '../../features/stock-movements/api'
import type { MovementType, StockMovementDto } from '../../features/stock-movements/types'
import { displayWarehouseCode } from '../../features/warehouses/format'
import { useWarehouses } from '../../features/warehouses/hooks/useWarehouses'
import { isAbortError, type ApiError } from '../../services/apiClient'
import { DsFilterDateRange } from '../../components/filters/DsFilterDateRange'

import { StockMovementFormModal } from './StockMovementFormModal'
import './stockMovementsPage.css'

const PAGE_SIZE = 15

const TYPE_OPTIONS: { value: '' | MovementType; label: string }[] = [
  { value: '', label: 'All types' },
  { value: 'INBOUND', label: 'Inbound' },
  { value: 'OUTBOUND', label: 'Outbound' },
  { value: 'TRANSFER', label: 'Transfer' },
]

function movementPillClass(t: MovementType): string {
  switch (t) {
    case 'INBOUND':
      return 'sm-type-pill sm-type--inbound'
    case 'OUTBOUND':
      return 'sm-type-pill sm-type--outbound'
    case 'TRANSFER':
      return 'sm-type-pill sm-type--transfer'
    default:
      return 'sm-type-pill'
  }
}

function formatQty(n: number): string {
  if (n > 0) return `+${n.toLocaleString('en-US')}`
  return n.toLocaleString('en-US')
}

function formatDateTime(iso: string | null): string {
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

export function StockMovementsPage() {
  const { hasCapability, currentUser } = useAuth()
  const canWrite = hasCapability('operations.write')
  const auditUsername = currentUser?.username?.trim() || 'system'

  const { data: warehouses } = useWarehouses()
  const [products, setProducts] = useState<ProductDto[] | null>(null)

  const [page, setPage] = useState(0)
  const [data, setData] = useState<{
    content: StockMovementDto[]
    totalElements: number
    totalPages: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [reloadTick, setReloadTick] = useState(0)

  const [warehouseId, setWarehouseId] = useState<number | null>(null)
  const [productId, setProductId] = useState<number | null>(null)
  const [movementType, setMovementType] = useState<'' | MovementType>('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const [modalOpen, setModalOpen] = useState(false)

  const refresh = useCallback(() => setReloadTick((x) => x + 1), [])

  useEffect(() => {
    let isCurrent = true
    const ac = new AbortController()
    listProducts(ac.signal)
      .then((list) => {
        if (isCurrent) setProducts(list)
      })
      .catch(() => {
        if (isCurrent) setProducts([])
      })
    return () => {
      isCurrent = false
      ac.abort()
    }
  }, [])

  const query = useMemo(
    () => ({
      page,
      size: PAGE_SIZE,
      warehouseId,
      productId,
      movementType,
      dateFrom: dateFrom ? `${dateFrom}T00:00:00` : null,
      dateTo: dateTo ? `${dateTo}T23:59:59` : null,
    }),
    [page, warehouseId, productId, movementType, dateFrom, dateTo],
  )

  useEffect(() => {
    let isCurrent = true
    const ac = new AbortController()
    setLoading(true)
    setLoadError(null)
    getStockMovementsPage(query, ac.signal)
      .then((res) => {
        if (!isCurrent) return
        setData({
          content: res.content,
          totalElements: res.totalElements,
          totalPages: res.totalPages,
        })
      })
      .catch((e) => {
        if (!isCurrent) return
        if (isAbortError(e)) return
        setLoadError((e as ApiError).message)
        setData(null)
      })
      .finally(() => {
        if (isCurrent) setLoading(false)
      })
    return () => {
      isCurrent = false
      ac.abort()
    }
  }, [query, reloadTick])

  useEffect(() => {
    setPage(0)
  }, [warehouseId, productId, movementType, dateFrom, dateTo])

  const pageSum = useMemo(() => {
    if (!data?.content.length) return 0
    return data.content.reduce((acc, r) => acc + r.quantityChange, 0)
  }, [data?.content])

  const showingFrom = data && data.totalElements > 0 ? page * PAGE_SIZE + 1 : 0
  const showingTo = data ? Math.min(data.totalElements, (page + 1) * PAGE_SIZE) : 0
  const pageCount = data ? Math.max(1, data.totalPages) : 1

  return (
    <div className="ds-page">
      <nav className="ds-breadcrumb" aria-label="Breadcrumb">
        <span>Operations</span>
        <span className="ds-breadcrumb-sep">/</span>
        <span>Stock movements</span>
      </nav>

      <div className="ds-page-header">
        <div>
          <h1 className="ds-page-title">STOCK MOVEMENTS</h1>
          <p className="sm-subtitle">
            Audit trail of inbound, outbound, and transfer events. Saving a movement updates physical AVAILABLE quantity on
            the default inventory line for that product and warehouse (prefers an unlocated row; creates one if needed).
          </p>
        </div>
        <div className="sm-header-actions">
          <button type="button" className="ds-btn-ghost" onClick={refresh}>
            Refresh
          </button>
          {canWrite ? (
            <button type="button" className="ds-btn-primary" onClick={() => setModalOpen(true)}>
              Record movement
            </button>
          ) : null}
        </div>
      </div>

      <div className="ds-stat-grid">
        <div className="ds-stat-card">
          <div className="ds-stat-card-header">
            <div>
              <div className="ds-stat-label">Movements (filtered)</div>
              <div className="ds-stat-value">
                {loading ? '…' : (data?.totalElements ?? 0).toLocaleString('en-US')}
              </div>
              <div className="ds-stat-sub">Total rows matching filters</div>
            </div>
          </div>
        </div>
        <div className="ds-stat-card">
          <div className="ds-stat-card-header">
            <div>
              <div className="ds-stat-label">Net qty (this page)</div>
              <div className="ds-stat-value">{loading ? '…' : formatQty(pageSum)}</div>
              <div className="ds-stat-sub">Sum of quantity change on current page</div>
            </div>
          </div>
        </div>
        <div className="ds-stat-card">
          <div className="ds-stat-card-header">
            <div>
              <div className="ds-stat-label">Page size</div>
              <div className="ds-stat-value">{PAGE_SIZE}</div>
              <div className="ds-stat-sub">Server-side pagination</div>
            </div>
          </div>
        </div>
      </div>

      <div className="ds-toolbar sm-toolbar">
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
          className="ds-filter-select sm-product-select"
          aria-label="Product"
          value={productId ?? ''}
          onChange={(e) => {
            const v = e.target.value
            setProductId(v === '' ? null : Number(v))
          }}
        >
          <option value="">All products</option>
          {(products ?? []).map((p) => (
            <option key={p.id} value={p.id}>
              {p.sku} — {p.name}
            </option>
          ))}
        </select>
        <select
          className="ds-filter-select"
          aria-label="Movement type"
          value={movementType}
          onChange={(e) => setMovementType(e.target.value as '' | MovementType)}
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value || 'all'} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <DsFilterDateRange
          from={dateFrom}
          to={dateTo}
          onFromChange={setDateFrom}
          onToChange={setDateTo}
          fromLabel="From"
          toLabel="To"
          fromAriaLabel="Movement date from"
          toAriaLabel="Movement date to"
        />
      </div>

      <p className="sm-related-strip">
        Related:{' '}
        <Link to="/inventory">Stock levels</Link>
        {' · '}
        <Link to="/products">Products</Link>
        {' · '}
        <Link to="/warehouses">Warehouses</Link>
      </p>

      {loading ? (
        <p className="app-muted" style={{ marginTop: 12 }}>
          Loading movements…
        </p>
      ) : loadError ? (
        <div style={{ marginTop: 12 }}>
          <p style={{ color: '#dc2626', fontWeight: 900 }}>Failed to load: {loadError}</p>
          <button type="button" className="ds-btn-primary" onClick={refresh}>
            Try again
          </button>
        </div>
      ) : !data || data.totalElements === 0 ? (
        <p style={{ marginTop: 12, fontWeight: 800 }}>No movements match your filters.</p>
      ) : (
        <>
          <div className="ds-table-wrap">
            <table className="ds-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Type</th>
                  <th>SKU</th>
                  <th>Product</th>
                  <th>Warehouse</th>
                  <th className="sm-num">Qty Δ</th>
                  <th>Reason</th>
                  <th>Recorded by</th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((row) => (
                  <tr key={row.id}>
                    <td className="sm-nowrap">{formatDateTime(row.movementDate)}</td>
                    <td>
                      <span className={movementPillClass(row.movementType)}>{row.movementType}</span>
                    </td>
                    <td className="sm-sku">{row.productSku ?? '—'}</td>
                    <td>
                      <div className="ds-name-block">
                        <div className="ds-name-main">{row.productName ?? '—'}</div>
                      </div>
                    </td>
                    <td>
                      <div className="ds-name-block">
                        <div className="ds-name-main">{row.warehouseCode ?? '—'}</div>
                        {row.warehouseName ? (
                          <span className="ds-link-sub" style={{ color: 'rgba(15,23,42,0.45)' }}>
                            {row.warehouseName}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="sm-num sm-qty">{formatQty(row.quantityChange)}</td>
                    <td>{row.reason?.trim() ? row.reason : '—'}</td>
                    <td>{row.createdBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="ds-pagination">
            <div className="ds-pagination-summary">
              Showing {showingFrom}-{showingTo} of {data.totalElements} movements
            </div>
            <div className="ds-pagination-buttons">
              <button
                type="button"
                className="ds-page-btn"
                disabled={page <= 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Prev
              </button>
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`ds-page-btn ${n === page + 1 ? 'ds-page-btn--active' : ''}`}
                  onClick={() => setPage(n - 1)}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                className="ds-page-btn"
                disabled={page >= pageCount - 1}
                onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      <StockMovementFormModal
        open={modalOpen}
        auditUsername={auditUsername}
        onClose={() => setModalOpen(false)}
        onCreated={refresh}
      />
    </div>
  )
}
