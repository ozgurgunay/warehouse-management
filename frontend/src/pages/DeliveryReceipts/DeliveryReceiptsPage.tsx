import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../../auth/AuthContext'
import { DsFilterDateRange } from '../../components/filters/DsFilterDateRange'
import { listDeliveryReceipts } from '../../features/delivery-receipts/api'
import type { DeliveryReceiptDto } from '../../features/delivery-receipts/types'
import { getShipmentsPage } from '../../features/shipments/api'
import type { ShipmentDto } from '../../features/shipments/types'
import { isAbortError, type ApiError } from '../../services/apiClient'

import { DeliveryReceiptDeleteModal } from './DeliveryReceiptDeleteModal'
import { DeliveryReceiptFormModal } from './DeliveryReceiptFormModal'
import './deliveryReceiptsPage.css'

const PAGE_SIZE = 15

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

function matchDateRange(iso: string | null, from: string, to: string): boolean {
  if (!from && !to) return true
  if (!iso) return false
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return false
  if (from) {
    const fromD = new Date(`${from}T00:00:00`)
    if (d < fromD) return false
  }
  if (to) {
    const toD = new Date(`${to}T23:59:59`)
    if (d > toD) return false
  }
  return true
}

export function DeliveryReceiptsPage() {
  const { hasCapability } = useAuth()
  const canWrite = hasCapability('operations.write')

  const [allRows, setAllRows] = useState<DeliveryReceiptDto[] | null>(null)
  const [shipments, setShipments] = useState<ShipmentDto[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [reloadTick, setReloadTick] = useState(0)

  const [page, setPage] = useState(0)
  const [shipmentIdFilter, setShipmentIdFilter] = useState<number | null>(null)
  const [receiverFilter, setReceiverFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<DeliveryReceiptDto | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<DeliveryReceiptDto | null>(null)

  const refresh = useCallback(() => setReloadTick((x) => x + 1), [])

  useEffect(() => {
    let isCurrent = true
    const ac = new AbortController()
    setLoading(true)
    setLoadError(null)
    Promise.all([listDeliveryReceipts(ac.signal), getShipmentsPage({ page: 0, size: 400 }, ac.signal)])
      .then(([receipts, shipmentsPage]) => {
        if (!isCurrent) return
        setAllRows(receipts)
        setShipments(shipmentsPage.content)
      })
      .catch((e) => {
        if (!isCurrent) return
        if (isAbortError(e)) return
        setLoadError((e as ApiError).message)
        setAllRows(null)
      })
      .finally(() => {
        if (isCurrent) setLoading(false)
      })
    return () => {
      isCurrent = false
      ac.abort()
    }
  }, [reloadTick])

  useEffect(() => {
    setPage(0)
  }, [shipmentIdFilter, receiverFilter, dateFrom, dateTo])

  const filteredRows = useMemo(() => {
    const list = allRows ?? []
    const receiverQ = receiverFilter.trim().toLowerCase()
    return list
      .filter((r) => (shipmentIdFilter == null ? true : r.shipmentId === shipmentIdFilter))
      .filter((r) => {
        if (!receiverQ) return true
        return (
          (r.receiverName ?? '').toLowerCase().includes(receiverQ) ||
          (r.receiverPhone ?? '').toLowerCase().includes(receiverQ)
        )
      })
      .filter((r) => matchDateRange(r.deliveredAt, dateFrom, dateTo))
      .sort((a, b) => {
        const ax = new Date(a.deliveredAt ?? 0).getTime()
        const bx = new Date(b.deliveredAt ?? 0).getTime()
        return bx - ax
      })
  }, [allRows, shipmentIdFilter, receiverFilter, dateFrom, dateTo])

  const pagedRows = useMemo(() => {
    const start = page * PAGE_SIZE
    return filteredRows.slice(start, start + PAGE_SIZE)
  }, [filteredRows, page])

  const shipmentById = useMemo(() => {
    const map = new Map<number, ShipmentDto>()
    for (const s of shipments ?? []) map.set(s.id, s)
    return map
  }, [shipments])

  const deliveredToday = useMemo(() => {
    const now = new Date()
    const y = now.getFullYear()
    const m = now.getMonth()
    const d = now.getDate()
    return filteredRows.filter((r) => {
      if (!r.deliveredAt) return false
      const x = new Date(r.deliveredAt)
      return x.getFullYear() === y && x.getMonth() === m && x.getDate() === d
    }).length
  }, [filteredRows])

  const withShipmentCount = useMemo(() => filteredRows.filter((r) => r.shipmentId != null).length, [filteredRows])

  const total = filteredRows.length
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const showingFrom = total === 0 ? 0 : page * PAGE_SIZE + 1
  const showingTo = Math.min(total, (page + 1) * PAGE_SIZE)

  return (
    <div className="ds-page">
      <nav className="ds-breadcrumb" aria-label="Breadcrumb">
        <span>Operations</span>
        <span className="ds-breadcrumb-sep">/</span>
        <span>Delivery receipts</span>
      </nav>

      <div className="ds-page-header">
        <div>
          <h1 className="ds-page-title">DELIVERY RECEIPTS</h1>
          <p className="dr-subtitle">
            Proof-of-delivery (POD) records linked to shipments. Capture who received the delivery, when it arrived, and
            any last-mile note for audit and dispute handling.
          </p>
        </div>
        <div className="dr-header-actions">
          <button type="button" className="ds-btn-ghost" onClick={refresh}>
            Refresh
          </button>
          {canWrite ? (
            <button
              type="button"
              className="ds-btn-primary"
              onClick={() => {
                setEditing(null)
                setFormOpen(true)
              }}
            >
              New receipt
            </button>
          ) : null}
        </div>
      </div>

      <div className="ds-stat-grid">
        <div className="ds-stat-card">
          <div className="ds-stat-card-header">
            <div>
              <div className="ds-stat-label">Receipts (filtered)</div>
              <div className="ds-stat-value">{loading ? '…' : total.toLocaleString('en-US')}</div>
              <div className="ds-stat-sub">Total rows matching filters</div>
            </div>
          </div>
        </div>
        <div className="ds-stat-card">
          <div className="ds-stat-card-header">
            <div>
              <div className="ds-stat-label">Delivered today</div>
              <div className="ds-stat-value">{loading ? '…' : deliveredToday.toLocaleString('en-US')}</div>
              <div className="ds-stat-sub">Rows delivered on current local date</div>
            </div>
          </div>
        </div>
        <div className="ds-stat-card">
          <div className="ds-stat-card-header">
            <div>
              <div className="ds-stat-label">Linked to shipment</div>
              <div className="ds-stat-value">{loading ? '…' : withShipmentCount.toLocaleString('en-US')}</div>
              <div className="ds-stat-sub">Rows with shipment relation</div>
            </div>
          </div>
        </div>
      </div>

      <div className="ds-toolbar dr-toolbar">
        <select
          className="ds-filter-select dr-shipment-select"
          value={shipmentIdFilter ?? ''}
          onChange={(e) => setShipmentIdFilter(e.target.value ? Number(e.target.value) : null)}
          aria-label="Shipment"
        >
          <option value="">All shipments</option>
          {(shipments ?? []).map((s) => (
            <option key={s.id} value={s.id}>
              #{s.id} · {s.status}
            </option>
          ))}
        </select>
        <input
          type="search"
          className="ds-search-input dr-search"
          placeholder="Receiver name or phone…"
          value={receiverFilter}
          onChange={(e) => setReceiverFilter(e.target.value)}
          aria-label="Receiver search"
        />
        <DsFilterDateRange
          from={dateFrom}
          to={dateTo}
          onFromChange={setDateFrom}
          onToChange={setDateTo}
          fromLabel="Delivered from"
          toLabel="Delivered to"
          fromAriaLabel="Delivered on or after"
          toAriaLabel="Delivered on or before"
        />
      </div>

      <p className="dr-related-strip">
        Related: <Link to="/shipments">Shipments</Link> · <Link to="/orders">Orders</Link> ·{' '}
        <Link to="/inventory-allocations">Allocations</Link>
      </p>

      {loading ? (
        <p className="app-muted" style={{ marginTop: 12 }}>
          Loading delivery receipts…
        </p>
      ) : loadError ? (
        <div style={{ marginTop: 12 }}>
          <p style={{ color: '#dc2626', fontWeight: 800 }}>Failed to load: {loadError}</p>
          <button type="button" className="ds-btn-primary" onClick={refresh}>
            Try again
          </button>
        </div>
      ) : total === 0 ? (
        <p style={{ marginTop: 12, fontWeight: 800 }}>No delivery receipts match your filters.</p>
      ) : (
        <>
          <div className="ds-table-wrap">
            <table className="ds-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Shipment</th>
                  <th>Shipment status</th>
                  <th>Receiver</th>
                  <th>Phone</th>
                  <th>Delivered at</th>
                  <th>Note</th>
                  <th className="ds-table__col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedRows.map((row) => {
                  const shipment = row.shipmentId != null ? shipmentById.get(row.shipmentId) : null
                  return (
                    <tr key={row.id}>
                      <td className="dr-mono">{row.id}</td>
                      <td className="dr-mono">{row.shipmentId != null ? `#${row.shipmentId}` : '—'}</td>
                      <td>{shipment?.status ?? '—'}</td>
                      <td>{row.receiverName?.trim() || '—'}</td>
                      <td className="dr-nowrap">{row.receiverPhone?.trim() || '—'}</td>
                      <td className="dr-nowrap">{formatDateTime(row.deliveredAt)}</td>
                      <td className="dr-note" title={row.deliveryNote ?? undefined}>
                        {row.deliveryNote?.trim() || '—'}
                      </td>
                      <td className="ds-table__col-actions">
                        <div className="ds-table-actions">
                          {canWrite ? (
                            <>
                              <button
                                type="button"
                                className="ds-row-action"
                                title="Edit"
                                aria-label="Edit delivery receipt"
                                onClick={() => {
                                  setEditing(row)
                                  setFormOpen(true)
                                }}
                              >
                                <IconPencil />
                              </button>
                              <button
                                type="button"
                                className="ds-row-action ds-row-action--danger"
                                title="Delete"
                                aria-label="Delete delivery receipt"
                                onClick={() => {
                                  setDeleteTarget(row)
                                  setDeleteOpen(true)
                                }}
                              >
                                <IconTrash />
                              </button>
                            </>
                          ) : (
                            <span className="app-muted" style={{ fontSize: 12 }}>
                              —
                            </span>
                          )}
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
              Showing {showingFrom}-{showingTo} of {total} receipts
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

      <DeliveryReceiptFormModal
        open={formOpen}
        initial={editing}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
        onSaved={refresh}
      />
      <DeliveryReceiptDeleteModal
        open={deleteOpen}
        row={deleteTarget}
        onClose={() => {
          setDeleteOpen(false)
          setDeleteTarget(null)
        }}
        onDeleted={refresh}
      />
    </div>
  )
}
