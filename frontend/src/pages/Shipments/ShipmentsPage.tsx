import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../../auth/AuthContext'
import { DsFilterDateRange } from '../../components/filters/DsFilterDateRange'
import { getShipmentsPage, patchShipmentStatus } from '../../features/shipments/api'
import { formatShippingMethod, shipmentStatusLabel } from '../../features/shipments/format'
import { listOrders } from '../../features/orders/api'
import type { OrderDto } from '../../features/orders/types'
import type { ShipmentDto, ShipmentStatus } from '../../features/shipments/types'
import { isAbortError, type ApiError } from '../../services/apiClient'

import { CreateShipmentModal } from './CreateShipmentModal'
import { DeliverShipmentModal } from './DeliverShipmentModal'
import { ShipmentDetailModal } from './ShipmentDetailModal'
import { ShipShipmentModal } from './ShipShipmentModal'
import './shipmentsPage.css'

const PAGE_SIZE = 15

const STATUS_OPTIONS: { value: '' | ShipmentStatus; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_TRANSIT', label: 'In transit' },
  { value: 'OUT_FOR_DELIVERY', label: 'Out for delivery' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'RETURNED', label: 'Returned' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

function statusPillClass(status: string): string {
  const base = 'sh-status-pill'
  switch (status) {
    case 'PENDING':
      return `${base} sh-status--pending`
    case 'IN_TRANSIT':
      return `${base} sh-status--in_transit`
    case 'OUT_FOR_DELIVERY':
      return `${base} sh-status--out_for_delivery`
    case 'DELIVERED':
      return `${base} sh-status--delivered`
    case 'RETURNED':
      return `${base} sh-status--returned`
    case 'CANCELLED':
      return `${base} sh-status--cancelled`
    default:
      return base
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

function formatDateOnly(iso: string | null): string {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return iso.slice(0, 10)
  }
}

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

function IconPackage() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M3.27 6.96L12 12.01l8.73-5.05" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function IconCheckCircle() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 12l2.5 2.5L16 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function IconMapPin() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s7-4.35 7-11a7 7 0 1 0-14 0c0 6.65 7 11 7 11Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function IconXCircle() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="m15 9-6 6M9 9l6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function ShipmentsPage() {
  const { hasCapability } = useAuth()
  const canWrite = hasCapability('operations.write')

  const [orders, setOrders] = useState<OrderDto[] | null>(null)

  const [page, setPage] = useState(0)
  const [data, setData] = useState<{
    content: ShipmentDto[]
    totalElements: number
    totalPages: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [reloadTick, setReloadTick] = useState(0)

  const [status, setStatus] = useState<'' | ShipmentStatus>('')
  const [orderId, setOrderId] = useState<number | null>(null)
  const [carrier, setCarrier] = useState('')
  const [tracking, setTracking] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const [createOpen, setCreateOpen] = useState(false)
  const [detailId, setDetailId] = useState<number | null>(null)
  const [detailInitial, setDetailInitial] = useState<ShipmentDto | null>(null)
  const [shipTarget, setShipTarget] = useState<ShipmentDto | null>(null)
  const [deliverTarget, setDeliverTarget] = useState<ShipmentDto | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionBusyId, setActionBusyId] = useState<number | null>(null)

  const refresh = useCallback(() => setReloadTick((x) => x + 1), [])

  useEffect(() => {
    let isCurrent = true
    const ac = new AbortController()
    listOrders({ page: 0, size: 300 }, ac.signal)
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
      status: status || null,
      orderId,
      carrier: carrier.trim() || null,
      tracking: tracking.trim() || null,
      shippedFrom: dateFrom ? `${dateFrom}T00:00:00` : null,
      shippedTo: dateTo ? `${dateTo}T23:59:59` : null,
    }),
    [page, status, orderId, carrier, tracking, dateFrom, dateTo],
  )

  useEffect(() => {
    let isCurrent = true
    const ac = new AbortController()
    setLoading(true)
    setLoadError(null)
    getShipmentsPage(query, ac.signal)
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
  }, [status, orderId, carrier, tracking, dateFrom, dateTo])

  const openDispatches = useMemo(() => {
    if (!data?.content.length) return 0
    return data.content.filter((r) =>
      ['PENDING', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(r.status),
    ).length
  }, [data?.content])

  const showingFrom = data && data.totalElements > 0 ? page * PAGE_SIZE + 1 : 0
  const showingTo = data ? Math.min(data.totalElements, (page + 1) * PAGE_SIZE) : 0
  const pageCount = data ? Math.max(1, data.totalPages) : 1

  async function handlePatchStatus(row: ShipmentDto, next: ShipmentStatus, confirmMsg: string) {
    if (!canWrite) return
    if (!window.confirm(confirmMsg)) return
    setActionError(null)
    setActionBusyId(row.id)
    try {
      await patchShipmentStatus(row.id, next)
      refresh()
    } catch (e) {
      setActionError((e as ApiError).message)
    } finally {
      setActionBusyId(null)
    }
  }

  return (
    <div className="ds-page">
      <nav className="ds-breadcrumb" aria-label="Breadcrumb">
        <span>Operations</span>
        <span className="ds-breadcrumb-sep">/</span>
        <span>Shipments</span>
      </nav>

      <div className="ds-page-header">
        <div>
          <h1 className="ds-page-title">SHIPMENTS</h1>
          <p className="sh-subtitle">
            Outbound dispatch records: draft shipments from orders, carrier hand-off with tracking, proof of delivery,
            and status alignment with the sales order. Shipped-date filters only match rows that already have a ship
            timestamp.
          </p>
        </div>
        <div className="sh-header-actions">
          <button type="button" className="ds-btn-ghost" onClick={refresh}>
            Refresh
          </button>
          {canWrite ? (
            <button type="button" className="ds-btn-primary" onClick={() => setCreateOpen(true)}>
              New shipment
            </button>
          ) : null}
        </div>
      </div>

      <div className="ds-stat-grid">
        <div className="ds-stat-card">
          <div className="ds-stat-card-header">
            <div>
              <div className="ds-stat-label">Shipments (filtered)</div>
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
              <div className="ds-stat-label">Open dispatches (this page)</div>
              <div className="ds-stat-value">{loading ? '…' : openDispatches.toLocaleString('en-US')}</div>
              <div className="ds-stat-sub">Pending, in transit, or out for delivery on the current page</div>
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

      <div className="ds-toolbar sh-toolbar">
        <select
          className="ds-filter-select"
          aria-label="Shipment status"
          value={status}
          onChange={(e) => setStatus(e.target.value as '' | ShipmentStatus)}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value || 'all'} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          className="ds-filter-select sh-order-select"
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
        <input
          type="search"
          className="ds-search-input sh-carrier-input"
          aria-label="Carrier contains"
          placeholder="Carrier…"
          value={carrier}
          onChange={(e) => setCarrier(e.target.value)}
        />
        <input
          type="search"
          className="ds-search-input sh-tracking-input"
          aria-label="Tracking contains"
          placeholder="Tracking…"
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
        />
        <DsFilterDateRange
          from={dateFrom}
          to={dateTo}
          onFromChange={setDateFrom}
          onToChange={setDateTo}
          fromLabel="Shipped from"
          toLabel="Shipped to"
          fromAriaLabel="Shipped on or after"
          toAriaLabel="Shipped on or before"
        />
      </div>

      <p className="sh-related-strip">
        Related:{' '}
        <Link to="/orders">Orders</Link>
        {' · '}
        <Link to="/inventory-allocations">Allocations</Link>
        {' · '}
        <Link to="/stock-movements">Stock movements</Link>
      </p>

      {actionError ? (
        <p style={{ color: '#dc2626', fontWeight: 800, marginTop: 12 }} role="alert">
          {actionError}
        </p>
      ) : null}

      {loading ? (
        <p className="app-muted" style={{ marginTop: 12 }}>
          Loading shipments…
        </p>
      ) : loadError ? (
        <div style={{ marginTop: 12 }}>
          <p style={{ color: '#dc2626', fontWeight: 900 }}>Failed to load: {loadError}</p>
          <button type="button" className="ds-btn-primary" onClick={refresh}>
            Try again
          </button>
        </div>
      ) : !data || data.totalElements === 0 ? (
        <p style={{ marginTop: 12, fontWeight: 800 }}>No shipments match your filters.</p>
      ) : (
        <>
          <div className="ds-table-wrap">
            <table className="ds-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Status</th>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Order date</th>
                  <th>Ship-to</th>
                  <th>Method</th>
                  <th>Carrier</th>
                  <th>Tracking</th>
                  <th>Shipped</th>
                  <th>Delivered</th>
                  <th className="ds-table__col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((row) => (
                  <tr key={row.id}>
                    <td className="sh-mono">{row.id}</td>
                    <td>
                      <span className={statusPillClass(row.status)} title={shipmentStatusLabel(row.status)}>
                        {row.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="sh-mono">{row.orderId != null ? `#${row.orderId}` : '—'}</td>
                    <td>
                      <div className="ds-name-block">
                        <div className="ds-name-main">{row.customerName?.trim() || '—'}</div>
                      </div>
                    </td>
                    <td className="sh-nowrap">{formatDateOnly(row.orderDate)}</td>
                    <td className="sh-address-preview" title={row.shippingAddress?.trim() || undefined}>
                      {row.shippingAddress?.trim() || '—'}
                    </td>
                    <td>{formatShippingMethod(row.shippingMethod)}</td>
                    <td>{row.carrier?.trim() || '—'}</td>
                    <td className="sh-mono">{row.trackingNumber?.trim() || '—'}</td>
                    <td className="sh-nowrap">{formatDateTime(row.shippedDate)}</td>
                    <td className="sh-nowrap">{formatDateTime(row.deliveredDate)}</td>
                    <td className="ds-table__col-actions">
                      <div className="ds-table-actions">
                        <button
                          type="button"
                          className="ds-row-action"
                          title="Details"
                          aria-label="View shipment details"
                          onClick={() => {
                            setDetailInitial(row)
                            setDetailId(row.id)
                          }}
                        >
                          <IconEye />
                        </button>
                        {canWrite && row.status === 'PENDING' ? (
                          <button
                            type="button"
                            className="ds-row-action"
                            title="Ship"
                            aria-label="Ship shipment"
                            disabled={actionBusyId === row.id}
                            onClick={() => setShipTarget(row)}
                          >
                            <IconPackage />
                          </button>
                        ) : null}
                        {canWrite && (row.status === 'IN_TRANSIT' || row.status === 'OUT_FOR_DELIVERY') ? (
                          <button
                            type="button"
                            className="ds-row-action"
                            title="Deliver"
                            aria-label="Record delivery"
                            disabled={actionBusyId === row.id}
                            onClick={() => setDeliverTarget(row)}
                          >
                            <IconCheckCircle />
                          </button>
                        ) : null}
                        {canWrite && row.status === 'IN_TRANSIT' ? (
                          <button
                            type="button"
                            className="ds-row-action"
                            title="Out for delivery"
                            aria-label="Mark out for delivery"
                            disabled={actionBusyId === row.id}
                            onClick={() =>
                              handlePatchStatus(
                                row,
                                'OUT_FOR_DELIVERY',
                                'Mark this shipment as out for delivery with the courier?',
                              )
                            }
                          >
                            <IconMapPin />
                          </button>
                        ) : null}
                        {canWrite && row.status === 'PENDING' ? (
                          <button
                            type="button"
                            className="ds-row-action ds-row-action--danger"
                            title="Cancel"
                            aria-label="Cancel shipment"
                            disabled={actionBusyId === row.id}
                            onClick={() =>
                              handlePatchStatus(row, 'CANCELLED', 'Cancel this draft shipment? This cannot be undone.')
                            }
                          >
                            <IconXCircle />
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
              Showing {showingFrom}-{showingTo} of {data.totalElements} shipments
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

      <CreateShipmentModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={refresh} />
      <ShipmentDetailModal
        open={detailId != null}
        shipmentId={detailId}
        initial={detailInitial}
        onClose={() => {
          setDetailId(null)
          setDetailInitial(null)
        }}
      />
      <ShipShipmentModal
        open={shipTarget != null}
        shipment={shipTarget}
        onClose={() => setShipTarget(null)}
        onShipped={refresh}
      />
      <DeliverShipmentModal
        open={deliverTarget != null}
        shipment={deliverTarget}
        onClose={() => setDeliverTarget(null)}
        onDelivered={refresh}
      />
    </div>
  )
}
