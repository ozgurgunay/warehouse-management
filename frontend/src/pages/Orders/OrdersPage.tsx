import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { DsFilterDateRange } from '../../components/filters/DsFilterDateRange'
import { useAuth } from '../../auth/AuthContext'
import { listCustomers } from '../../features/customers/api'
import type { CustomerDto } from '../../features/customers/types'
import { listOrders } from '../../features/orders/api'
import {
  customerShippingSubline,
  derivePriority,
  formatMoneyUsd,
  formatOrderDateCompact,
  formatOrderRef,
  orderStatusBadgeClass,
  tableStatusLabel,
  ORDER_STATUS_OPTIONS,
} from '../../features/orders/format'
import type { OrderDto, OrderStatus } from '../../features/orders/types'
import { isAbortError, type ApiError } from '../../services/apiClient'

import { OrderDetailModal } from './OrderDetailModal'
import './ordersPage.css'

const PAGE_SIZE = 20
const STATS_PAGE_SIZE = 500

function IconEye() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function IconDownload() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 4v10m0 0 4-4m-4 4-4-4M4 18h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconPrint() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 6V4h10v2M7 18h10v2H7v-2zm-3-4h16v8H4v-8zm3-6h10v2H7v-2z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconTruck() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M1 12h15M4 19h2m10 0h2M5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM1 12V7h14v5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconClock() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 12l2.5 2.5L16 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function IconChart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 19h16M6 15l4-4 3 3 5-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function exportOrdersCsv(rows: OrderDto[], customerName: (id: number) => string) {
  const header = ['orderId', 'customer', 'orderDate', 'amount', 'status', 'priority']
  const lines = [
    header.join(','),
    ...rows.map((r) => {
      const pr = derivePriority(r.status)
      return [
        formatOrderRef(r.id),
        csvEscape(customerName(r.customerId)),
        r.orderDate ?? '',
        r.totalAmount ?? '',
        r.status,
        pr.label,
      ].join(',')
    }),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function csvEscape(s: string): string {
  if (s.includes('"') || s.includes(',') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export function OrdersPage() {
  const { hasCapability } = useAuth()
  const canWrite = hasCapability('sales.write')

  const [rows, setRows] = useState<OrderDto[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [reloadTick, setReloadTick] = useState(0)

  const [page, setPage] = useState(0)
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const [customers, setCustomers] = useState<CustomerDto[] | null>(null)
  const [statsOrders, setStatsOrders] = useState<OrderDto[] | null>(null)
  const [detailId, setDetailId] = useState<number | null>(null)

  const refresh = useCallback(() => setReloadTick((x) => x + 1), [])

  useEffect(() => {
    let isCurrent = true
    const ac = new AbortController()
    listCustomers(ac.signal)
      .then((list) => {
        if (isCurrent) setCustomers(list)
      })
      .catch(() => {
        if (isCurrent) setCustomers([])
      })
    return () => {
      isCurrent = false
      ac.abort()
    }
  }, [])

  useEffect(() => {
    let isCurrent = true
    const ac = new AbortController()
    listOrders({ page: 0, size: STATS_PAGE_SIZE }, ac.signal)
      .then((data) => {
        if (isCurrent) setStatsOrders(data)
      })
      .catch(() => {
        if (isCurrent) setStatsOrders([])
      })
    return () => {
      isCurrent = false
      ac.abort()
    }
  }, [reloadTick])

  useEffect(() => {
    let isCurrent = true
    const ac = new AbortController()
    setLoading(true)
    setLoadError(null)
    listOrders(
      {
        page,
        size: PAGE_SIZE,
        status: statusFilter || null,
        customerId: null,
      },
      ac.signal,
    )
      .then((data) => {
        if (!isCurrent) return
        setRows(data)
      })
      .catch((e) => {
        if (!isCurrent) return
        if (isAbortError(e)) return
        setLoadError((e as ApiError).message)
        setRows([])
      })
      .finally(() => {
        if (isCurrent) setLoading(false)
      })
    return () => {
      isCurrent = false
      ac.abort()
    }
  }, [page, statusFilter, reloadTick])

  const customerNameById = useMemo(() => {
    const m = new Map<number, string>()
    for (const c of customers ?? []) {
      m.set(c.id, c.fullName?.trim() || `#${c.id}`)
    }
    return m
  }, [customers])

  const kpi = useMemo(() => {
    const list = statsOrders ?? []
    const total = list.length
    const pendingFulfillment = list.filter((o) =>
      ['PENDING', 'APPROVED', 'PACKING'].includes(o.status),
    ).length
    const inTransit = list.filter((o) => o.status === 'SHIPPED').length
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const completedToday = list.filter((o) => {
      if (o.status !== 'DELIVERED' || !o.orderDate) return false
      const t = new Date(o.orderDate).getTime()
      return t >= startOfDay
    }).length
    return { total, pendingFulfillment, inTransit, completedToday, capped: list.length >= STATS_PAGE_SIZE }
  }, [statsOrders])

  const rowsAfterDate = useMemo(() => {
    if (!dateFrom && !dateTo) return rows
    return rows.filter((r) => {
      if (!r.orderDate) return false
      const t = new Date(r.orderDate).getTime()
      if (dateFrom) {
        const from = new Date(`${dateFrom}T00:00:00`).getTime()
        if (t < from) return false
      }
      if (dateTo) {
        const to = new Date(`${dateTo}T23:59:59`).getTime()
        if (t > to) return false
      }
      return true
    })
  }, [rows, dateFrom, dateTo])

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return rowsAfterDate
    return rowsAfterDate.filter((r) => {
      const name = customerNameById.get(r.customerId)?.toLowerCase() ?? ''
      const ref = formatOrderRef(r.id).toLowerCase().replace(/-/g, '')
      const q2 = q.replace(/-/g, '').replace(/^so/, '')
      return (
        String(r.id).includes(q2) ||
        name.includes(q) ||
        ref.includes(q2) ||
        `so${r.id}`.includes(q2)
      )
    })
  }, [rowsAfterDate, searchQuery, customerNameById])

  useEffect(() => {
    setPage(0)
  }, [statusFilter])

  const hasNext = rows.length === PAGE_SIZE
  const hasPrev = page > 0

  const detailRow = useMemo(() => {
    if (detailId == null) return null
    return rows.find((r) => r.id === detailId) ?? null
  }, [detailId, rows])

  const tableStart = filteredRows.length === 0 ? 0 : page * PAGE_SIZE + 1
  const tableEnd = page * PAGE_SIZE + filteredRows.length
  const totalSnapshot = statsOrders?.length ?? 0

  /** Minimum known page count from server cursor (0-based page index). */
  const pageCount = hasNext ? page + 2 : page + 1

  return (
    <div className="ds-page">
      <nav className="ds-breadcrumb" aria-label="Breadcrumb">
        <span>Sales</span>
        <span className="ds-breadcrumb-sep">/</span>
        <span>Orders</span>
      </nav>

      <div className="ds-page-header">
        <div>
          <h1 className="ds-page-title ord-page-title">Orders</h1>
          <p className="ord-page-subtitle">Manage and optimize outbound fulfillment streams.</p>
        </div>
        <div className="ord-header-actions">
          <button
            type="button"
            className="ds-btn-ghost ord-btn-icon"
            disabled={loading || filteredRows.length === 0}
            onClick={() => exportOrdersCsv(filteredRows, (id) => customerNameById.get(id) ?? `Customer #${id}`)}
            title="Export current page rows as CSV"
          >
            <IconDownload />
            Export
          </button>
          <button type="button" className="ds-btn-ghost ord-btn-icon" disabled title="Bulk print (coming soon)">
            <IconPrint />
            Bulk print
          </button>
          {canWrite ? (
            <button
              type="button"
              className="ds-btn-primary ord-btn-icon"
              disabled
              title="Guided order creation in the app is not available yet. Use the REST API until this ships."
            >
              New order
            </button>
          ) : null}
        </div>
      </div>

      <div className="ord-kpi-grid">
        <div className="ord-kpi-card ord-kpi-card--blue">
          <div className="ord-kpi-head">
            <div>
              <div className="ord-kpi-label">Total orders</div>
              <div className="ord-kpi-value">{statsOrders == null ? '…' : kpi.total}{kpi.capped ? '+' : ''}</div>
            </div>
            <div className="ord-kpi-icon" aria-hidden>
              <IconChart />
            </div>
          </div>
          <div className="ord-kpi-meta">Snapshot · up to {STATS_PAGE_SIZE} rows</div>
          <div className="ord-kpi-trend">Live KPIs from warehouse data</div>
        </div>
        <div className="ord-kpi-card ord-kpi-card--amber">
          <div className="ord-kpi-head">
            <div>
              <div className="ord-kpi-label">Pending fulfillment</div>
              <div className="ord-kpi-value">{statsOrders == null ? '…' : kpi.pendingFulfillment}</div>
            </div>
            <div className="ord-kpi-icon" aria-hidden>
              <IconClock />
            </div>
          </div>
          <div className="ord-kpi-meta">Pending · approved · picking</div>
        </div>
        <div className="ord-kpi-card ord-kpi-card--slate">
          <div className="ord-kpi-head">
            <div>
              <div className="ord-kpi-label">In transit</div>
              <div className="ord-kpi-value">{statsOrders == null ? '…' : kpi.inTransit}</div>
            </div>
            <div className="ord-kpi-icon" aria-hidden>
              <IconTruck />
            </div>
          </div>
          <div className="ord-kpi-meta">Status: shipped</div>
        </div>
        <div className="ord-kpi-card ord-kpi-card--teal">
          <div className="ord-kpi-head">
            <div>
              <div className="ord-kpi-label">Completed today</div>
              <div className="ord-kpi-value">{statsOrders == null ? '…' : kpi.completedToday}</div>
            </div>
            <div className="ord-kpi-icon" aria-hidden>
              <IconCheck />
            </div>
          </div>
          <div className="ord-kpi-meta">Delivered (local calendar day)</div>
        </div>
      </div>

      <div className="ds-toolbar ord-toolbar">
        <div className="ds-search-wrap">
          <input
            type="search"
            className="ds-search-input ord-search-input"
            placeholder="Search customer name or order ID…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search orders"
          />
        </div>
        <select
          className="ds-filter-select ord-status-select"
          aria-label="Order status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | '')}
        >
          <option value="">All statuses</option>
          {ORDER_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <DsFilterDateRange
          from={dateFrom}
          to={dateTo}
          onFromChange={setDateFrom}
          onToChange={setDateTo}
          fromLabel="Ordered from"
          toLabel="Ordered to"
          fromAriaLabel="Ordered on or after"
          toAriaLabel="Ordered on or before"
        />
      </div>

      <p className="ord-related-strip">
        Related: <Link to="/customers">Customers</Link> · <Link to="/inventory-allocations">Allocations</Link> ·{' '}
        <Link to="/shipments">Shipments</Link>
        <span className="ord-related-hint" title="Filters apply to the server-loaded page.">
          {' '}
          · Search, status, and dates refine the current page.
        </span>
      </p>

      {loadError ? (
        <div style={{ marginTop: 12 }}>
          <p style={{ color: '#dc2626', fontWeight: 900 }}>Failed to load: {loadError}</p>
          <button type="button" className="ds-btn-primary" onClick={refresh}>
            Try again
          </button>
        </div>
      ) : loading ? (
        <p className="app-muted" style={{ marginTop: 12 }}>
          Loading orders…
        </p>
      ) : rows.length === 0 ? (
        <p style={{ marginTop: 12, fontWeight: 800 }}>No orders match your filters.</p>
      ) : filteredRows.length === 0 ? (
        <p className="app-muted" style={{ marginTop: 12 }}>
          No rows match the current date range or search on this page.
        </p>
      ) : (
        <>
          <div className="ds-table-wrap">
            <table className="ds-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th className="ord-num">Amount</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th className="ds-table__col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => {
                  const pr = derivePriority(row.status)
                  const cust = customerNameById.get(row.customerId) ?? `Customer #${row.customerId}`
                  return (
                    <tr key={row.id}>
                      <td className="ord-id-cell ord-mono">{formatOrderRef(row.id)}</td>
                      <td>
                        <div className="ord-customer-main">{cust}</div>
                        <div className="ord-customer-sub">{customerShippingSubline(row.shippingAddress)}</div>
                      </td>
                      <td className="ord-nowrap">{formatOrderDateCompact(row.orderDate)}</td>
                      <td className="ord-num ord-amt-cell">{formatMoneyUsd(row.totalAmount)}</td>
                      <td>
                        <span className={orderStatusBadgeClass(row.status)}>{tableStatusLabel(row.status)}</span>
                      </td>
                      <td>
                        <span className="ord-priority">
                          <span
                            className={`ord-priority-dot ord-priority-dot--${pr.tone === 'urgent' ? 'urgent' : pr.tone === 'high' ? 'high' : 'normal'}`}
                            aria-hidden
                          />
                          {pr.label}
                        </span>
                      </td>
                      <td className="ds-table__col-actions">
                        <div className="ds-table-actions">
                          <button
                            type="button"
                            className="ds-row-action"
                            title="View order details"
                            aria-label={`View order ${formatOrderRef(row.id)}`}
                            onClick={() => setDetailId(row.id)}
                          >
                            <IconEye />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="ds-pagination">
            <div className="ds-pagination-summary">
              Showing {tableStart}-{tableEnd} of {totalSnapshot} orders (snapshot)
              {hasNext ? ' · more pages available' : ''}
            </div>
            <div className="ds-pagination-buttons">
              <button
                type="button"
                className="ds-page-btn"
                disabled={!hasPrev}
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
                disabled={!hasNext}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {detailId != null && detailRow ? (
        <OrderDetailModal
          orderId={detailId}
          customerName={customerNameById.get(detailRow.customerId) ?? `Customer #${detailRow.customerId}`}
          onClose={() => setDetailId(null)}
          onUpdated={refresh}
        />
      ) : null}
    </div>
  )
}
