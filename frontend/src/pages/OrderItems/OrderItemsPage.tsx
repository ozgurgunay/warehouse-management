import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../../auth/AuthContext'
import { deleteOrderItem, listOrderItems } from '../../features/order-items/api'
import { listOrders } from '../../features/orders/api'
import { formatMoneyUsd, formatOrderRef } from '../../features/orders/format'
import type { OrderDto, OrderItemDto } from '../../features/orders/types'
import { listProducts } from '../../features/products/api'
import type { ProductDto } from '../../features/products/types'
import { isAbortError, type ApiError } from '../../services/apiClient'

import { OrderItemCreateModal } from './OrderItemCreateModal'
import { OrderItemDeleteModal } from './OrderItemDeleteModal'
import { OrderItemLineModal } from './OrderItemLineModal'
import './orderItemsPage.css'

const PAGE_SIZE = 20

function IconPencil() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 20h4l10.5-10.5a2 2 0 0 0 0-2.83l-1.67-1.67a2 2 0 0 0-2.83 0L4 15.5V20Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconTrash() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 7h12M10 11v6M14 11v6M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M8 7h8l-1 13a1 1 0 0 1-1 1H10a1 1 0 0 1-1-1L8 7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function csvEscape(s: string): string {
  if (s.includes('"') || s.includes(',') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function exportLinesCsv(
  rows: OrderItemDto[],
  productName: (id: number) => string,
  productSku: (id: number) => string,
) {
  const header = ['lineId', 'orderRef', 'productId', 'productName', 'sku', 'quantity', 'unitPrice', 'lineTotal', 'batch', 'barcode']
  const lines = [
    header.join(','),
    ...rows.map((r) =>
      [
        r.id,
        formatOrderRef(r.orderId),
        r.productId,
        csvEscape(productName(r.productId)),
        csvEscape(productSku(r.productId)),
        r.quantity,
        r.unitPrice ?? '',
        r.totalPrice ?? '',
        csvEscape(r.batchNo ?? ''),
        csvEscape(r.barcode ?? ''),
      ].join(','),
    ),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `order-lines-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function OrderItemsPage() {
  const { hasCapability } = useAuth()
  const canWrite = hasCapability('sales.write')

  const [rows, setRows] = useState<OrderItemDto[] | null>(null)
  const [orders, setOrders] = useState<OrderDto[] | null>(null)
  const [products, setProducts] = useState<ProductDto[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [reloadTick, setReloadTick] = useState(0)

  const [search, setSearch] = useState('')
  const [orderFilter, setOrderFilter] = useState<number | ''>('')
  const [productFilter, setProductFilter] = useState<number | ''>('')
  const [page, setPage] = useState(1)

  const [lineModalId, setLineModalId] = useState<number | null>(null)
  const [lineModalProduct, setLineModalProduct] = useState<{ name: string; sku: string } | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleteWorking, setDeleteWorking] = useState(false)

  const refresh = useCallback(() => setReloadTick((x) => x + 1), [])

  useEffect(() => {
    let isCurrent = true
    const ac = new AbortController()
    setLoading(true)
    setLoadError(null)
    Promise.all([listOrderItems(ac.signal), listOrders({ page: 0, size: 500 }, ac.signal), listProducts(ac.signal)])
      .then(([items, ord, prod]) => {
        if (!isCurrent) return
        setRows(items)
        setOrders(ord)
        setProducts(prod)
      })
      .catch((e) => {
        if (!isCurrent) return
        if (isAbortError(e)) return
        setLoadError((e as ApiError).message)
        setRows([])
        setOrders([])
        setProducts([])
      })
      .finally(() => {
        if (isCurrent) setLoading(false)
      })
    return () => {
      isCurrent = false
      ac.abort()
    }
  }, [reloadTick])

  const productById = useMemo(() => {
    const m = new Map<number, ProductDto>()
    for (const p of products ?? []) {
      if (p.id != null) m.set(p.id, p)
    }
    return m
  }, [products])

  const productName = useCallback(
    (id: number) => productById.get(id)?.name?.trim() || `Product #${id}`,
    [productById],
  )
  const productSku = useCallback((id: number) => productById.get(id)?.sku?.trim() || '—', [productById])

  const filtered = useMemo(() => {
    if (!rows) return []
    let list = [...rows]
    if (orderFilter !== '') {
      list = list.filter((r) => r.orderId === orderFilter)
    }
    if (productFilter !== '') {
      list = list.filter((r) => r.productId === productFilter)
    }
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter((r) => {
        const name = productName(r.productId).toLowerCase()
        const sku = productSku(r.productId).toLowerCase()
        const ref = formatOrderRef(r.orderId).toLowerCase()
        const hay = [
          String(r.id),
          String(r.orderId),
          String(r.productId),
          name,
          sku,
          ref,
          (r.batchNo ?? '').toLowerCase(),
          (r.barcode ?? '').toLowerCase(),
          (r.qrCode ?? '').toLowerCase(),
        ].join(' ')
        return hay.includes(q)
      })
    }
    list.sort((a, b) => {
      if (b.orderId !== a.orderId) return b.orderId - a.orderId
      return b.id - a.id
    })
    return list
  }, [rows, orderFilter, productFilter, search, productName, productSku])

  useEffect(() => {
    setPage(1)
  }, [search, orderFilter, productFilter, rows?.length])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const paged = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, safePage])

  useEffect(() => {
    if (page !== safePage) setPage(safePage)
  }, [page, safePage])

  const showingFrom = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const showingTo = Math.min(filtered.length, safePage * PAGE_SIZE)

  const totalQty = useMemo(() => filtered.reduce((s, r) => s + (r.quantity || 0), 0), [filtered])
  const distinctOrders = useMemo(() => new Set(filtered.map((r) => r.orderId)).size, [filtered])

  const runDelete = async () => {
    if (deleteId == null) return
    setDeleteWorking(true)
    try {
      await deleteOrderItem(deleteId)
      setDeleteId(null)
      refresh()
    } catch (e) {
      window.alert((e as ApiError).message ?? 'Delete failed')
    } finally {
      setDeleteWorking(false)
    }
  }

  const openLineModal = (r: OrderItemDto) => {
    setLineModalProduct({ name: productName(r.productId), sku: productSku(r.productId) })
    setLineModalId(r.id)
  }

  return (
    <div className="ds-page">
      <nav className="ds-breadcrumb" aria-label="Breadcrumb">
        <span>Sales</span>
        <span className="ds-breadcrumb-sep">/</span>
        <span>Order items</span>
      </nav>

      <div className="ds-page-header oi-page-header">
        <div>
          <h1 className="ds-page-title">Order items</h1>
          <p className="oi-page-subtitle">
            Line-level view for picking and auditing: quantity, pricing, and identifiers per order line.
          </p>
        </div>
        <div className="oi-header-actions">
          <button type="button" className="ds-btn-ghost" onClick={refresh} disabled={loading}>
            Refresh
          </button>
          <button
            type="button"
            className="ds-btn-ghost"
            disabled={loading || filtered.length === 0}
            onClick={() => exportLinesCsv(filtered, productName, productSku)}
          >
            Export CSV
          </button>
          {canWrite ? (
            <button
              type="button"
              className="ds-btn-primary"
              disabled={loading || !orders?.length || !products?.length}
              title={
                !orders?.length || !products?.length
                  ? 'Load orders and products first'
                  : 'Add a line to an existing order'
              }
              onClick={() => setCreateOpen(true)}
            >
              New line
            </button>
          ) : null}
        </div>
      </div>

      <div className="ds-stat-grid oi-stat-grid">
        <div className="ds-stat-card">
          <div className="ds-stat-label">Lines (filtered)</div>
          <div className="ds-stat-value">{loading ? '…' : filtered.length}</div>
        </div>
        <div className="ds-stat-card">
          <div className="ds-stat-label">Quantity (sum)</div>
          <div className="ds-stat-value">{loading ? '…' : totalQty.toLocaleString('en-US')}</div>
        </div>
        <div className="ds-stat-card">
          <div className="ds-stat-label">Orders represented</div>
          <div className="ds-stat-value">{loading ? '…' : distinctOrders}</div>
        </div>
      </div>

      <div className="ds-toolbar oi-toolbar">
        <div className="ds-search-wrap">
          <input
            type="search"
            className="ds-search-input"
            placeholder="Search line ID, order, product, SKU, batch, barcode…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search order lines"
          />
        </div>
        <select
          className="ds-filter-select oi-order-select"
          aria-label="Filter by order"
          value={orderFilter === '' ? '' : String(orderFilter)}
          onChange={(e) => setOrderFilter(e.target.value ? Number(e.target.value) : '')}
        >
          <option value="">All orders</option>
          {(orders ?? []).map((o) => (
            <option key={o.id} value={o.id}>
              {formatOrderRef(o.id)}
              {o.orderDate ? ` · ${o.orderDate.slice(0, 10)}` : ''}
            </option>
          ))}
        </select>
        <select
          className="ds-filter-select oi-product-select"
          aria-label="Filter by product"
          value={productFilter === '' ? '' : String(productFilter)}
          onChange={(e) => setProductFilter(e.target.value ? Number(e.target.value) : '')}
        >
          <option value="">All products</option>
          {(products ?? [])
            .filter((p) => p.id != null)
            .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku})
              </option>
            ))}
        </select>
      </div>

      <p className="oi-related-strip">
        Related:{' '}
        <Link to="/orders" className="ds-link-accent">
          Orders
        </Link>{' '}
        ·{' '}
        <Link to="/customers" className="ds-link-accent">
          Customers
        </Link>{' '}
        ·{' '}
        <Link to="/products" className="ds-link-accent">
          Products
        </Link>
      </p>

      {loading ? (
        <p className="app-muted" style={{ marginTop: 12 }}>
          Loading order lines…
        </p>
      ) : loadError ? (
        <div style={{ marginTop: 12 }}>
          <p style={{ color: '#dc2626', fontWeight: 900 }}>Failed to load: {loadError}</p>
          <button type="button" className="ds-btn-primary" onClick={refresh}>
            Try again
          </button>
        </div>
      ) : !rows || rows.length === 0 ? (
        <p style={{ marginTop: 12, fontWeight: 800 }}>No order lines yet.</p>
      ) : filtered.length === 0 ? (
        <p className="app-muted" style={{ marginTop: 12 }}>
          No lines match your filters.
        </p>
      ) : (
        <>
          <div className="ds-table-wrap">
            <table className="ds-table">
              <thead>
                <tr>
                  <th>Line ID</th>
                  <th>Order</th>
                  <th>Product</th>
                  <th className="oi-num">Qty</th>
                  <th className="oi-num">Unit</th>
                  <th className="oi-num">Line total</th>
                  <th>Batch</th>
                  <th>Barcode</th>
                  <th className="ds-table__col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((r) => (
                  <tr key={r.id}>
                    <td className="oi-mono" style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {r.id}
                    </td>
                    <td>
                      <Link
                        className="ds-link-accent oi-mono"
                        to="/orders"
                        title="Open orders (list)"
                      >
                        {formatOrderRef(r.orderId)}
                      </Link>
                    </td>
                    <td>
                      <div className="oi-product-main">{productName(r.productId)}</div>
                      <div className="oi-product-sub">{productSku(r.productId)}</div>
                    </td>
                    <td className="oi-num">{r.quantity}</td>
                    <td className="oi-num">{formatMoneyUsd(r.unitPrice)}</td>
                    <td className="oi-num" style={{ fontWeight: 900 }}>
                      {formatMoneyUsd(r.totalPrice)}
                    </td>
                    <td className="oi-mono">{r.batchNo?.trim() || '—'}</td>
                    <td className="oi-mono">{r.barcode?.trim() || '—'}</td>
                    <td className="ds-table__col-actions">
                      <div className="ds-table-actions">
                        <button
                          type="button"
                          className="ds-row-action"
                          title={canWrite ? 'Edit line' : 'View line'}
                          aria-label={`Open line ${r.id}`}
                          onClick={() => openLineModal(r)}
                        >
                          <IconPencil />
                        </button>
                        {canWrite ? (
                          <button
                            type="button"
                            className="ds-row-action ds-row-action--danger"
                            title="Delete line"
                            aria-label={`Delete line ${r.id}`}
                            onClick={() => setDeleteId(r.id)}
                          >
                            <IconTrash />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="ds-pagination">
            <div className="ds-pagination-summary">
              Showing {showingFrom}-{showingTo} of {filtered.length} order lines
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

      {lineModalId != null && lineModalProduct ? (
        <OrderItemLineModal
          lineId={lineModalId}
          productLabel={lineModalProduct.name}
          skuLabel={lineModalProduct.sku}
          onClose={() => {
            setLineModalId(null)
            setLineModalProduct(null)
          }}
          onSaved={refresh}
        />
      ) : null}

      {createOpen && orders && products ? (
        <OrderItemCreateModal
          orders={orders}
          products={products.filter((p): p is ProductDto & { id: number } => typeof p.id === 'number')}
          onClose={() => setCreateOpen(false)}
          onCreated={refresh}
        />
      ) : null}

      {deleteId != null ? (
        <OrderItemDeleteModal
          lineId={deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={() => void runDelete()}
          isDeleting={deleteWorking}
        />
      ) : null}
    </div>
  )
}
