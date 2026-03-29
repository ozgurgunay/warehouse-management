import { useEffect, useState } from 'react'

import { getShipmentById } from '../../features/shipments/api'
import { formatShippingMethod, shipmentStatusLabel } from '../../features/shipments/format'
import type { ShipmentDto } from '../../features/shipments/types'
import { isAbortError, type ApiError } from '../../services/apiClient'

import '../Admin/adminModals.css'
import './shipmentsPage.css'

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

type Props = {
  open: boolean
  shipmentId: number | null
  initial: ShipmentDto | null
  onClose: () => void
}

export function ShipmentDetailModal({ open, shipmentId, initial, onClose }: Props) {
  const [row, setRow] = useState<ShipmentDto | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  useEffect(() => {
    if (!open) {
      setRow(null)
      setLoadError(null)
      return
    }
    if (initial) setRow(initial)
    if (!shipmentId) return
    const ac = new AbortController()
    setLoading(true)
    setLoadError(null)
    getShipmentById(shipmentId, ac.signal)
      .then((dto) => {
        if (!ac.signal.aborted) setRow(dto)
      })
      .catch((e) => {
        if (isAbortError(e)) return
        setLoadError((e as ApiError).message)
        if (initial) setRow(initial)
      })
      .finally(() => {
        if (!ac.signal.aborted) setLoading(false)
      })
    return () => ac.abort()
  }, [open, shipmentId, initial])

  if (!open) return null

  const s = row ?? initial
  if (!s) {
    return (
      <div
        className="admin-modal-overlay"
        role="presentation"
        onMouseDown={(ev) => ev.target === ev.currentTarget && onClose()}
      >
        <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="sh-detail-title">
          <div className="admin-modal-header">
            <div id="sh-detail-title" className="admin-modal-title">
              Shipment
            </div>
            <button type="button" className="admin-modal-close-button" onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>
          <div className="admin-modal-body">
            <p style={{ margin: 0 }}>No data.</p>
          </div>
          <div className="admin-modal-actions">
            <button type="button" className="ds-btn-primary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  async function copyText(label: string, value: string | null) {
    if (!value?.trim()) return
    try {
      await navigator.clipboard.writeText(value.trim())
    } catch {
      window.prompt(`Copy ${label}`, value.trim())
    }
  }

  return (
    <div
      className="admin-modal-overlay"
      role="presentation"
      onMouseDown={(ev) => ev.target === ev.currentTarget && onClose()}
    >
      <div className="admin-modal sh-modal-wide" role="dialog" aria-modal="true" aria-labelledby="sh-detail-title">
        <div className="admin-modal-header">
          <div id="sh-detail-title" className="admin-modal-title">
            Shipment #{s.id}
          </div>
          <button type="button" className="admin-modal-close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="admin-modal-body">
          {loading ? <p className="app-muted" style={{ marginTop: 0 }}>Refreshing…</p> : null}
          {loadError ? (
            <p style={{ color: '#b45309', fontWeight: 800, margin: '0 0 8px' }}>Could not refresh: {loadError}</p>
          ) : null}
          <dl className="sh-detail-dl">
            <dt>Status</dt>
            <dd>{shipmentStatusLabel(s.status)}</dd>
            <dt>Order</dt>
            <dd>{s.orderId != null ? `#${s.orderId}` : '—'}</dd>
            <dt>Order date</dt>
            <dd>{formatDateTime(s.orderDate)}</dd>
            <dt>Customer</dt>
            <dd>{s.customerName?.trim() || '—'}</dd>
            <dt>Ship-to</dt>
            <dd style={{ whiteSpace: 'pre-wrap' }}>{s.shippingAddress?.trim() || '—'}</dd>
            <dt>Method</dt>
            <dd>{formatShippingMethod(s.shippingMethod)}</dd>
            <dt>Method notes</dt>
            <dd>{s.shippingMethodDescription?.trim() || '—'}</dd>
            <dt>ETA</dt>
            <dd>{formatDateTime(s.estimatedArrivalDate)}</dd>
            <dt>Freight cost</dt>
            <dd>
              {s.shipmentCost != null && !Number.isNaN(s.shipmentCost)
                ? s.shipmentCost.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
                : '—'}
            </dd>
            <dt>Carrier</dt>
            <dd>{s.carrier?.trim() || '—'}</dd>
            <dt>Tracking</dt>
            <dd className="sh-detail-mono">{s.trackingNumber?.trim() || '—'}</dd>
            <dt>Shipped</dt>
            <dd>{formatDateTime(s.shippedDate)}</dd>
            <dt>Delivered</dt>
            <dd>{formatDateTime(s.deliveredDate)}</dd>
            <dt>Barcode</dt>
            <dd className="sh-detail-actions">
              <span className="sh-detail-mono">{s.barcode?.trim() || '—'}</span>
              {s.barcode?.trim() ? (
                <button type="button" className="ds-btn-ghost" onClick={() => copyText('barcode', s.barcode)}>
                  Copy
                </button>
              ) : null}
            </dd>
            <dt>QR</dt>
            <dd className="sh-detail-actions">
              <span className="sh-detail-mono sh-detail-break">{s.qrCode?.trim() || '—'}</span>
              {s.qrCode?.trim() ? (
                <button type="button" className="ds-btn-ghost" onClick={() => copyText('QR payload', s.qrCode)}>
                  Copy
                </button>
              ) : null}
            </dd>
          </dl>
        </div>
        <div className="admin-modal-actions">
          <button type="button" className="ds-btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
