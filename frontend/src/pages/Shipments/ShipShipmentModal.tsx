import { useEffect, useState } from 'react'

import { markShipmentShipped } from '../../features/shipments/api'
import type { ShipmentDto } from '../../features/shipments/types'
import { isAbortError, type ApiError } from '../../services/apiClient'

import '../Admin/adminModals.css'

function toDatetimeLocalValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function localDatetimeToIso(local: string): string {
  if (!local) return ''
  const withSeconds = local.length === 16 ? `${local}:00` : local
  const d = new Date(withSeconds)
  if (Number.isNaN(d.getTime())) return withSeconds
  return d.toISOString()
}

type Props = {
  open: boolean
  shipment: ShipmentDto | null
  onClose: () => void
  onShipped: () => void
}

export function ShipShipmentModal({ open, shipment, onClose, onShipped }: Props) {
  const [carrier, setCarrier] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [shippedAtLocal, setShippedAtLocal] = useState('')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

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
    if (!open || !shipment) return
    setCarrier(shipment.carrier?.trim() || '')
    setTrackingNumber(shipment.trackingNumber?.trim() || '')
    setShippedAtLocal(toDatetimeLocalValue(new Date()))
    setSubmitError(null)
  }, [open, shipment])

  if (!open || !shipment) return null

  const shipmentId = shipment.id

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError(null)
    const c = carrier.trim()
    if (!c) {
      setSubmitError('Carrier is required (e.g. DHL, UPS, national post).')
      return
    }
    if (!shippedAtLocal) {
      setSubmitError('Hand-off time is required.')
      return
    }
    setSubmitting(true)
    try {
      await markShipmentShipped(shipmentId, {
        carrier: c,
        trackingNumber: trackingNumber.trim() || null,
        shippedAt: localDatetimeToIso(shippedAtLocal),
      })
      onShipped()
      onClose()
    } catch (err) {
      if (!isAbortError(err)) setSubmitError((err as ApiError).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="admin-modal-overlay"
      role="presentation"
      onMouseDown={(ev) => ev.target === ev.currentTarget && onClose()}
    >
      <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="sh-ship-title">
        <div className="admin-modal-header">
          <div id="sh-ship-title" className="admin-modal-title">
            Mark shipped · #{shipment.id}
          </div>
          <button type="button" className="admin-modal-close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="admin-modal-body">
            <div className="admin-modal-field-grid">
              {submitError ? (
                <p style={{ color: '#dc2626', fontWeight: 800, margin: 0 }}>{submitError}</p>
              ) : null}
              <p style={{ margin: 0, fontSize: 13, color: 'rgba(15,23,42,0.65)', lineHeight: 1.45 }}>
                Records carrier hand-off: status becomes IN_TRANSIT, shipped timestamp is set, and the sales order is
                updated to match.
              </p>
              <div>
                <div className="admin-label">Carrier *</div>
                <input
                  className="admin-input"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  placeholder="e.g. DHL, UPS, Aras, Yurtiçi"
                  autoComplete="organization"
                  required
                />
              </div>
              <div>
                <div className="admin-label">Tracking number (optional)</div>
                <input
                  className="admin-input"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Carrier tracking ID"
                  autoComplete="off"
                />
              </div>
              <div>
                <div className="admin-label">Handed to carrier at *</div>
                <input
                  type="datetime-local"
                  className="admin-input"
                  value={shippedAtLocal}
                  onChange={(e) => setShippedAtLocal(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          <div className="admin-modal-actions">
            <button type="button" className="ds-btn-ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="ds-btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : 'Confirm shipment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
