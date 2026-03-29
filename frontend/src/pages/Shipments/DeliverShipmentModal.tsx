import { useEffect, useState } from 'react'

import { markShipmentDelivered } from '../../features/shipments/api'
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
  onDelivered: () => void
}

export function DeliverShipmentModal({ open, shipment, onClose, onDelivered }: Props) {
  const [receiverName, setReceiverName] = useState('')
  const [receiverPhone, setReceiverPhone] = useState('')
  const [deliveryNote, setDeliveryNote] = useState('')
  const [deliveredAtLocal, setDeliveredAtLocal] = useState('')
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
    setReceiverName('')
    setReceiverPhone('')
    setDeliveryNote('')
    setDeliveredAtLocal(toDatetimeLocalValue(new Date()))
    setSubmitError(null)
  }, [open, shipment])

  if (!open || !shipment) return null

  const shipmentId = shipment.id

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError(null)
    const name = receiverName.trim()
    const phone = receiverPhone.trim()
    if (!name || !phone) {
      setSubmitError('Receiver name and phone are required for proof of delivery.')
      return
    }
    if (!deliveredAtLocal) {
      setSubmitError('Delivery time is required.')
      return
    }
    setSubmitting(true)
    try {
      await markShipmentDelivered(shipmentId, {
        receiverName: name,
        receiverPhone: phone,
        deliveryNote: deliveryNote.trim() || null,
        deliveredAt: localDatetimeToIso(deliveredAtLocal),
      })
      onDelivered()
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
      <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="sh-deliver-title">
        <div className="admin-modal-header">
          <div id="sh-deliver-title" className="admin-modal-title">
            Proof of delivery · #{shipment.id}
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
                Closes the outbound leg: creates a delivery receipt, sets DELIVERED, and consumes inventory allocations
                for the order on the server.
              </p>
              <div>
                <div className="admin-label">Received by (name) *</div>
                <input
                  className="admin-input"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  placeholder="Signatory or site contact"
                  autoComplete="name"
                  required
                />
              </div>
              <div>
                <div className="admin-label">Receiver phone *</div>
                <input
                  className="admin-input"
                  value={receiverPhone}
                  onChange={(e) => setReceiverPhone(e.target.value)}
                  placeholder="+90 …"
                  autoComplete="tel"
                  required
                />
              </div>
              <div>
                <div className="admin-label">Delivery note (optional)</div>
                <textarea
                  className="admin-input"
                  style={{ minHeight: 72, resize: 'vertical' }}
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  placeholder="Condition, dock door, partial receipt…"
                />
              </div>
              <div>
                <div className="admin-label">Delivered at *</div>
                <input
                  type="datetime-local"
                  className="admin-input"
                  value={deliveredAtLocal}
                  onChange={(e) => setDeliveredAtLocal(e.target.value)}
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
              {submitting ? 'Saving…' : 'Confirm delivery'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
