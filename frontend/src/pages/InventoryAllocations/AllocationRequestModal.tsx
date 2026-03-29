import { useEffect, useState } from 'react'

import { allocateStockForOrder } from '../../features/inventory-allocations/api'
import { listOrders } from '../../features/orders/api'
import type { OrderDto } from '../../features/orders/types'
import { listProducts } from '../../features/products/api'
import type { ProductDto } from '../../features/products/types'
import { isAbortError, type ApiError } from '../../services/apiClient'

import '../Admin/adminModals.css'

type Props = {
  open: boolean
  onClose: () => void
  onAllocated: () => void
}

function orderLabel(o: OrderDto): string {
  const d = o.orderDate ? o.orderDate.slice(0, 10) : '—'
  return `#${o.id} · ${d}${o.status ? ` · ${o.status}` : ''}`
}

export function AllocationRequestModal({ open, onClose, onAllocated }: Props) {
  const [products, setProducts] = useState<ProductDto[] | null>(null)
  const [orders, setOrders] = useState<OrderDto[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [orderId, setOrderId] = useState<number | ''>('')
  const [productId, setProductId] = useState<number | ''>('')
  const [quantity, setQuantity] = useState<number | ''>('')

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
    Promise.all([listProducts(ac.signal), listOrders({ page: 0, size: 200 }, ac.signal)])
      .then(([p, o]) => {
        if (ac.signal.aborted) return
        setProducts(p)
        setOrders(o)
      })
      .catch((e) => {
        if (isAbortError(e)) return
        setLoadError((e as ApiError).message)
        setProducts(null)
        setOrders(null)
      })
    return () => ac.abort()
  }, [open])

  useEffect(() => {
    if (!open) {
      setOrderId('')
      setProductId('')
      setQuantity('')
      setSubmitError(null)
      setLoadError(null)
    }
  }, [open])

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError(null)
    if (orderId === '' || productId === '' || quantity === '' || quantity <= 0) {
      setSubmitError('Order, product, and a positive quantity are required.')
      return
    }
    setSubmitting(true)
    try {
      await allocateStockForOrder({
        orderId: Number(orderId),
        productId: Number(productId),
        quantity: Number(quantity),
      })
      onAllocated()
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
      <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="ia-alloc-modal-title">
        <div className="admin-modal-header">
          <div id="ia-alloc-modal-title" className="admin-modal-title">
            Allocate stock to order
          </div>
          <button type="button" className="admin-modal-close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="admin-modal-body">
            <div className="admin-modal-field-grid">
              {loadError ? (
                <p style={{ color: '#dc2626', fontWeight: 800, margin: 0 }}>Could not load data: {loadError}</p>
              ) : null}
              {submitError ? (
                <p style={{ color: '#dc2626', fontWeight: 800, margin: 0 }}>{submitError}</p>
              ) : null}
              <p style={{ margin: 0, fontSize: 13, color: 'rgba(15,23,42,0.65)', lineHeight: 1.45 }}>
                Reserves stock using FEFO (first expiring inventory lines). Active allocations block available quantity
                until released, consumed, or expired.
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
                      {orderLabel(o)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="admin-label">Product</div>
                <select
                  className="ds-filter-select"
                  style={{ width: '100%' }}
                  required
                  value={productId === '' ? '' : String(productId)}
                  onChange={(e) => setProductId(e.target.value === '' ? '' : Number(e.target.value))}
                >
                  <option value="">Select product…</option>
                  {(products ?? []).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.sku} — {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="admin-label">Quantity to allocate</div>
                <input
                  type="number"
                  className="admin-input"
                  min={1}
                  step={1}
                  required
                  value={quantity === '' ? '' : quantity}
                  onChange={(e) => {
                    const v = e.target.value
                    setQuantity(v === '' ? '' : Number(v))
                  }}
                />
              </div>
            </div>
          </div>
          <div className="admin-modal-actions">
            <button type="button" className="ds-btn-ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button
              type="submit"
              className="ds-btn-primary"
              disabled={submitting || !products?.length || !orders?.length}
            >
              {submitting ? 'Allocating…' : 'Allocate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
