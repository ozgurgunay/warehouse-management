import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../../auth/AuthContext'
import { getAllocationsPage } from '../../features/inventory-allocations/api'
import type { AllocationStatus, InventoryAllocationDto } from '../../features/inventory-allocations/types'
import { listOrders } from '../../features/orders/api'
import type { OrderDto } from '../../features/orders/types'
import { listProducts } from '../../features/products/api'
import type { ProductDto } from '../../features/products/types'
import { displayWarehouseCode } from '../../features/warehouses/format'
import { useWarehouses } from '../../features/warehouses/hooks/useWarehouses'
import { isAbortError, type ApiError } from '../../services/apiClient'
import { DsFilterDateRange } from '../../components/filters/DsFilterDateRange'

import { AllocationRequestModal } from './AllocationRequestModal'
import './inventoryAllocationsPage.css'

const PAGE_SIZE = 15

const STATUS_OPTIONS: { value: '' | AllocationStatus; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'RELEASED', label: 'Released' },
  { value: 'USED', label: 'Used' },
  { value: 'EXPIRED', label: 'Expired' },
]

function statusPillClass(s: AllocationStatus): string {
  switch (s) {
    case 'ACTIVE':
      return 'ia-status-pill ia-status--active'
    case 'RELEASED':
      return 'ia-status-pill ia-status--released'
    case 'USED':
      return 'ia-status-pill ia-status--used'
    case 'EXPIRED':
      return 'ia-status-pill ia-status--expired'
    default:
      return 'ia-status-pill'
  }
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

export function InventoryAllocationsPage() {
  const { hasCapability } = useAuth()
  const canWrite = hasCapability('operations.write')

  const { data: warehouses } = useWarehouses()
  const [products, setProducts] = useState<ProductDto[] | null>(null)
  const [orders, setOrders] = useState<OrderDto[] | null>(null)

  const [page, setPage] = useState(0)
  const [data, setData] = useState<{
    content: InventoryAllocationDto[]
    totalElements: number
    totalPages: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [reloadTick, setReloadTick] = useState(0)

  const [warehouseId, setWarehouseId] = useState<number | null>(null)
  const [productId, setProductId] = useState<number | null>(null)
  const [orderId, setOrderId] = useState<number | null>(null)
  const [status, setStatus] = useState<'' | AllocationStatus>('')
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

  useEffect(() => {
    let isCurrent = true
    const ac = new AbortController()
    listOrders({ page: 0, size: 200 }, ac.signal)
      .then((list) => {
        if (isCurrent) setOrders(list)
      })
      .catch(() => {
        if (isCurrent) setOrders([])
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
      orderId,
      status,
      dateFrom: dateFrom ? `${dateFrom}T00:00:00` : null,
      dateTo: dateTo ? `${dateTo}T23:59:59` : null,
    }),
    [page, warehouseId, productId, orderId, status, dateFrom, dateTo],
  )

  useEffect(() => {
    let isCurrent = true
    const ac = new AbortController()
    setLoading(true)
    setLoadError(null)
    getAllocationsPage(query, ac.signal)
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
  }, [warehouseId, productId, orderId, status, dateFrom, dateTo])

  const pageQty = useMemo(() => {
    if (!data?.content.length) return 0
    return data.content.reduce((acc, r) => acc + r.allocatedQuantity, 0)
  }, [data?.content])

  const showingFrom = data && data.totalElements > 0 ? page * PAGE_SIZE + 1 : 0
  const showingTo = data ? Math.min(data.totalElements, (page + 1) * PAGE_SIZE) : 0
  const pageCount = data ? Math.max(1, data.totalPages) : 1

  return (
    <div className="ds-page">
      <nav className="ds-breadcrumb" aria-label="Breadcrumb">
        <span>Operations</span>
        <span className="ds-breadcrumb-sep">/</span>
        <span>Allocations</span>
      </nav>

      <div className="ds-page-header">
        <div>
          <h1 className="ds-page-title">INVENTORY ALLOCATIONS</h1>
          <p className="ia-subtitle">
            Reservations that tie on-hand inventory to orders (FEFO allocation). Filter by warehouse, product, order, or
            status; use Allocate to reserve stock against an order.
          </p>
        </div>
        <div className="ia-header-actions">
          <button type="button" className="ds-btn-ghost" onClick={refresh}>
            Refresh
          </button>
          {canWrite ? (
            <button type="button" className="ds-btn-primary" onClick={() => setModalOpen(true)}>
              Allocate stock
            </button>
          ) : null}
        </div>
      </div>

      <div className="ds-stat-grid">
        <div className="ds-stat-card">
          <div className="ds-stat-card-header">
            <div>
              <div className="ds-stat-label">Allocations (filtered)</div>
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
              <div className="ds-stat-label">Reserved qty (this page)</div>
              <div className="ds-stat-value">{loading ? '…' : pageQty.toLocaleString('en-US')}</div>
              <div className="ds-stat-sub">Sum of allocated quantity on current page</div>
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

      <div className="ds-toolbar ia-toolbar">
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
          className="ds-filter-select ia-product-select"
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
          className="ds-filter-select ia-order-select"
          aria-label="Order"
          value={orderId ?? ''}
          onChange={(e) => {
            const v = e.target.value
            setOrderId(v === '' ? null : Number(v))
          }}
        >
          <option value="">All orders</option>
          {(orders ?? []).map((o) => (
            <option key={o.id} value={o.id}>
              #{o.id}
              {o.orderDate ? ` · ${o.orderDate.slice(0, 10)}` : ''}
              {o.status ? ` · ${o.status}` : ''}
            </option>
          ))}
        </select>
        <select
          className="ds-filter-select"
          aria-label="Allocation status"
          value={status}
          onChange={(e) => setStatus(e.target.value as '' | AllocationStatus)}
        >
          {STATUS_OPTIONS.map((o) => (
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
          fromAriaLabel="Created from"
          toAriaLabel="Created to"
        />
      </div>

      <p className="ia-related-strip">
        Related:{' '}
        <Link to="/inventory">Stock levels</Link>
        {' · '}
        <Link to="/stock-movements">Stock movements</Link>
        {' · '}
        <Link to="/orders">Orders</Link>
      </p>

      {loading ? (
        <p className="app-muted" style={{ marginTop: 12 }}>
          Loading allocations…
        </p>
      ) : loadError ? (
        <div style={{ marginTop: 12 }}>
          <p style={{ color: '#dc2626', fontWeight: 900 }}>Failed to load: {loadError}</p>
          <button type="button" className="ds-btn-primary" onClick={refresh}>
            Try again
          </button>
        </div>
      ) : !data || data.totalElements === 0 ? (
        <p style={{ marginTop: 12, fontWeight: 800 }}>No allocations match your filters.</p>
      ) : (
        <>
          <div className="ds-table-wrap">
            <table className="ds-table">
              <thead>
                <tr>
                  <th>Created</th>
                  <th>Status</th>
                  <th>Order</th>
                  <th>SKU</th>
                  <th>Product</th>
                  <th>Warehouse</th>
                  <th>Location</th>
                  <th className="ia-num">Qty</th>
                  <th>Expires</th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((row) => (
                  <tr key={row.id}>
                    <td className="ia-nowrap">{formatDateTime(row.createdAt)}</td>
                    <td>
                      <span className={statusPillClass(row.status)}>{row.status}</span>
                    </td>
                    <td className="ia-mono">#{row.orderId}</td>
                    <td className="ia-sku">{row.productSku ?? '—'}</td>
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
                    <td>{row.storageLocationLabel ?? '—'}</td>
                    <td className="ia-num ia-qty">{row.allocatedQuantity.toLocaleString('en-US')}</td>
                    <td className="ia-nowrap">{formatDateTime(row.expirationTime)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="ds-pagination">
            <div className="ds-pagination-summary">
              Showing {showingFrom}-{showingTo} of {data.totalElements} allocations
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

      <AllocationRequestModal open={modalOpen} onClose={() => setModalOpen(false)} onAllocated={refresh} />
    </div>
  )
}
