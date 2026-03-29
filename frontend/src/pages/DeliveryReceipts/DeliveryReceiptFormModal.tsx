import { useEffect, useState } from 'react'

import { createDeliveryReceipt, updateDeliveryReceipt } from '../../features/delivery-receipts/api'
import type {
  DeliveryReceiptDto,
  DeliveryReceiptUpsertPayload,
} from '../../features/delivery-receipts/types'
import { getShipmentsPage } from '../../features/shipments/api'
import type { ShipmentDto } from '../../features/shipments/types'
import { isAbortError, type ApiError } from '../../services/apiClient'

import '../Admin/adminModals.css'

function toDatetimeLocalValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes(),
  )}`
}

function isoToLocalDatetime(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return toDatetimeLocalValue(d)
}

function localDatetimeToIso(local: string): string | null {
  if (!local) return null
  const withSeconds = local.length === 16 ? `${local}:00` : local
  const d = new Date(withSeconds)
  if (Number.isNaN(d.getTime())) return withSeconds
  return d.toISOString()
}

type Props = {
  open: boolean
  initial: DeliveryReceiptDto | null
  onClose: () => void
  onSaved: () => void
}

export function DeliveryReceiptFormModal({ open, initial, onClose, onSaved }: Props) {
  const isEdit = !!initial
  const [shipments, setShipments] = useState<ShipmentDto[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [shipmentId, setShipmentId] = useState<number | ''>('')
  const [receiverName, setReceiverName] = useState('')
  const [receiverPhone, setReceiverPhone] = useState('')
  const [deliveryNote, setDeliveryNote] = useState('')
  const [deliveredAtLocal, setDeliveredAtLocal] = useState('')

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const ac = new AbortController()
    setLoadError(null)
    getShipmentsPage({ page: 0, size: 300 }, ac.signal)
      .then((res) => {
        if (!ac.signal.aborted) setShipments(res.content)
      })
      .catch((e) => {
        if (isAbortError(e)) return
        setLoadError((e as ApiError).message)
        setShipments([])
      })
    return () => ac.abort()
  }, [open])

  useEffect(() => {
    if (!open) return
    setSubmitError(null)
    if (!initial) {
      setShipmentId('')
      setReceiverName('')
      setReceiverPhone('')
      setDeliveryNote('')
      setDeliveredAtLocal(toDatetimeLocalValue(new Date()))
      return
    }
    setShipmentId(initial.shipmentId ?? '')
    setReceiverName(initial.receiverName ?? '')
    setReceiverPhone(initial.receiverPhone ?? '')
    setDeliveryNote(initial.deliveryNote ?? '')
    setDeliveredAtLocal(isoToLocalDatetime(initial.deliveredAt) || toDatetimeLocalValue(new Date()))
  }, [open, initial])

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError(null)
    if (shipmentId === '' || Number(shipmentId) <= 0) {
      setSubmitError('Shipment is required.')
      return
    }
    if (!receiverName.trim() || !receiverPhone.trim()) {
      setSubmitError('Receiver name and phone are required.')
      return
    }
    const payload: DeliveryReceiptUpsertPayload = {
      shipmentId: Number(shipmentId),
      receiverName: receiverName.trim(),
      receiverPhone: receiverPhone.trim(),
      deliveryNote: deliveryNote.trim() || null,
      deliveredAt: localDatetimeToIso(deliveredAtLocal),
    }
    setSubmitting(true)
    try {
      if (isEdit && initial) await updateDeliveryReceipt(initial.id, payload)
      else await createDeliveryReceipt(payload)
      onSaved()
      onClose()
    } catch (e) {
      setSubmitError((e as ApiError).message)
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
      <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="dr-form-title">
        <div className="admin-modal-header">
          <div id="dr-form-title" className="admin-modal-title">
            {isEdit ? `Edit delivery receipt #${initial?.id}` : 'Create delivery receipt'}
          </div>
          <button type="button" className="admin-modal-close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="admin-modal-body">
            <div className="admin-modal-field-grid">
              {loadError ? (
                <p style={{ color: '#b45309', margin: 0, fontWeight: 800 }}>Shipments list unavailable: {loadError}</p>
              ) : null}
              {submitError ? <p style={{ color: '#dc2626', margin: 0, fontWeight: 800 }}>{submitError}</p> : null}

              <div>
                <div className="admin-label">Shipment *</div>
                <select
                  className="ds-filter-select"
                  style={{ width: '100%' }}
                  value={shipmentId === '' ? '' : String(shipmentId)}
                  onChange={(e) => setShipmentId(e.target.value ? Number(e.target.value) : '')}
                  required
                >
                  <option value="">Select shipment…</option>
                  {(shipments ?? []).map((s) => (
                    <option key={s.id} value={s.id}>
                      #{s.id} · {s.status}
                      {s.customerName ? ` · ${s.customerName}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="admin-label">Receiver name *</div>
                <input
                  className="admin-input"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  required
                />
              </div>
              <div>
                <div className="admin-label">Receiver phone *</div>
                <input
                  className="admin-input"
                  value={receiverPhone}
                  onChange={(e) => setReceiverPhone(e.target.value)}
                  required
                />
              </div>
              <div>
                <div className="admin-label">Delivered at</div>
                <input
                  type="datetime-local"
                  className="admin-input"
                  value={deliveredAtLocal}
                  onChange={(e) => setDeliveredAtLocal(e.target.value)}
                />
              </div>
              <div>
                <div className="admin-label">Delivery note</div>
                <textarea
                  className="admin-input"
                  style={{ minHeight: 86, resize: 'vertical' }}
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  placeholder="Gate, condition, short POD details..."
                />
              </div>
            </div>
          </div>
          <div className="admin-modal-actions">
            <button type="button" className="ds-btn-ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="ds-btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create receipt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
