import { useEffect, useState } from 'react'

import { createShipment } from '../../features/shipments/api'
import type { ShipmentDto, ShippingMethod } from '../../features/shipments/types'
import { listOrders } from '../../features/orders/api'
import type { OrderDto } from '../../features/orders/types'
import { isAbortError, type ApiError } from '../../services/apiClient'

import '../Admin/adminModals.css'

const METHODS: { value: ShippingMethod; label: string }[] = [
  { value: 'STANDARD_COURIER', label: 'Standard courier' },
  { value: 'EXPRESS_COURIER', label: 'Express courier' },
  { value: 'CARGO_TRUCK', label: 'Cargo / truck' },
  { value: 'PICKUP_AT_STORE', label: 'Pickup at store' },
  { value: 'PICKUP_AT_WAREHOUSE', label: 'Pickup at warehouse' },
  { value: 'IN_HOUSE_DELIVERY', label: 'In-house delivery' },
  { value: 'LOCKER', label: 'Locker' },
  { value: 'INTERNATIONAL', label: 'International' },
  { value: 'CUSTOM', label: 'Custom (describe below)' },
]

type Props = {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export function CreateShipmentModal({ open, onClose, onCreated }: Props) {
  const [orders, setOrders] = useState<OrderDto[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [orderId, setOrderId] = useState<number | ''>('')
  const [shippingAddress, setShippingAddress] = useState('')
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('STANDARD_COURIER')
  const [shippingMethodDescription, setShippingMethodDescription] = useState('')
  const [estimatedArrival, setEstimatedArrival] = useState('')
  const [shipmentCost, setShipmentCost] = useState<number | ''>('')

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
    if (!open) return
    const ac = new AbortController()
    setLoadError(null)
    listOrders({ page: 0, size: 300 }, ac.signal)
      .then((list) => {
        if (!ac.signal.aborted) setOrders(list)
      })
      .catch((e) => {
        if (isAbortError(e)) return
        setLoadError((e as ApiError).message)
        setOrders([])
      })
    return () => ac.abort()
  }, [open])

  useEffect(() => {
    if (!open) {
      setOrderId('')
      setShippingAddress('')
      setShippingMethod('STANDARD_COURIER')
      setShippingMethodDescription('')
      setEstimatedArrival('')
      setShipmentCost('')
      setSubmitError(null)
      setLoadError(null)
    }
  }, [open])

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError(null)
    if (orderId === '' || !shippingAddress.trim()) {
      setSubmitError('Order and shipping address are required.')
      return
    }
    const body: Partial<ShipmentDto> & { orderId: number } = {
      orderId: Number(orderId),
      shippingAddress: shippingAddress.trim(),
      shippingMethod,
      shippingMethodDescription: shippingMethodDescription.trim() || null,
      estimatedArrivalDate: estimatedArrival ? `${estimatedArrival}:00` : null,
      shipmentCost: shipmentCost === '' ? null : Number(shipmentCost),
    }
    setSubmitting(true)
    try {
      await createShipment(body)
      onCreated()
      onClose()
    } catch (err) {
      setSubmitError((err as ApiError).message)
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
      <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="sh-create-title">
        <div className="admin-modal-header">
          <div id="sh-create-title" className="admin-modal-title">
            Create shipment
          </div>
          <button type="button" className="admin-modal-close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="admin-modal-body">
            <div className="admin-modal-field-grid">
              {loadError ? (
                <p style={{ color: '#dc2626', fontWeight: 800, margin: 0 }}>Could not load orders: {loadError}</p>
              ) : null}
              {submitError ? (
                <p style={{ color: '#dc2626', fontWeight: 800, margin: 0 }}>{submitError}</p>
              ) : null}
              <p style={{ margin: 0, fontSize: 13, color: 'rgba(15,23,42,0.65)', lineHeight: 1.45 }}>
                Creates a draft shipment (PENDING). Add carrier and tracking when you hand off to the carrier.
              </p>
              <div>
                <div className="admin-label">Order</div>
                <select
                  className="ds-filter-select"
                  style={{ width: '100%' }}
                  required
                  value={orderId === '' ? '' : String(orderId)}
                  onChange={(e) => setOrderId(e.target.value === '' ? '' : Number(e.target.value))}
                >
                  <option value="">Select order…</option>
                  {(orders ?? []).map((o) => (
                    <option key={o.id} value={o.id}>
                      #{o.id}
                      {o.orderDate ? ` · ${o.orderDate.slice(0, 10)}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="admin-label">Ship-to address</div>
                <textarea
                  className="admin-input"
                  style={{ minHeight: 88, resize: 'vertical' }}
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Full delivery address"
                />
              </div>
              <div>
                <div className="admin-label">Shipping method</div>
                <select
                  className="ds-filter-select"
                  style={{ width: '100%' }}
                  value={shippingMethod}
                  onChange={(e) => setShippingMethod(e.target.value as ShippingMethod)}
                >
                  {METHODS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="admin-label">Method notes (optional)</div>
                <input
                  className="admin-input"
                  value={shippingMethodDescription}
                  onChange={(e) => setShippingMethodDescription(e.target.value)}
                  placeholder="e.g. Leave at reception"
                />
              </div>
              <div>
                <div className="admin-label">Estimated arrival (optional)</div>
                <input
                  type="datetime-local"
                  className="admin-input"
                  value={estimatedArrival}
                  onChange={(e) => setEstimatedArrival(e.target.value)}
                />
              </div>
              <div>
                <div className="admin-label">Freight cost (optional)</div>
                <input
                  type="number"
                  className="admin-input"
                  min={0}
                  step={0.01}
                  value={shipmentCost === '' ? '' : shipmentCost}
                  onChange={(e) => {
                    const v = e.target.value
                    setShipmentCost(v === '' ? '' : Number(v))
                  }}
                />
              </div>
            </div>
          </div>
          <div className="admin-modal-actions">
            <button type="button" className="ds-btn-ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="ds-btn-primary" disabled={submitting || !orders?.length}>
              {submitting ? 'Creating…' : 'Create shipment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
