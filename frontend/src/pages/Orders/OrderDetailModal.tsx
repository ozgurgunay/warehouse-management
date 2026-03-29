import { useEffect, useMemo, useState } from 'react'

import { useAuth } from '../../auth/AuthContext'
import { getOrder, patchOrderStatus } from '../../features/orders/api'
import {
  formatMoneyUsd,
  formatOrderDate,
  orderStatusBadgeClass,
  orderStatusLabel,
  ORDER_STATUS_OPTIONS,
} from '../../features/orders/format'
import type { OrderDto, OrderStatus } from '../../features/orders/types'
import { listProducts } from '../../features/products/api'
import type { ProductDto } from '../../features/products/types'
import { isAbortError, type ApiError } from '../../services/apiClient'

import '../Admin/adminModals.css'
import './ordersPage.css'

type Props = {
  orderId: number
  customerName?: string
  onClose: () => void
  onUpdated: () => void
}

export function OrderDetailModal({ orderId, customerName, onClose, onUpdated }: Props) {
  const { hasCapability } = useAuth()
  const canWrite = hasCapability('sales.write')

  const [order, setOrder] = useState<OrderDto | null>(null)
  const [products, setProducts] = useState<ProductDto[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusDraft, setStatusDraft] = useState<OrderStatus | ''>('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const ac = new AbortController()
    setLoading(true)
    setError(null)
    Promise.all([
      getOrder(orderId, ac.signal),
      listProducts(ac.signal).catch(() => [] as ProductDto[]),
    ])
      .then(([o, plist]) => {
        if (ac.signal.aborted) return
        setOrder(o)
        setProducts(plist)
        setStatusDraft((o.status as OrderStatus) ?? 'PENDING')
      })
      .catch((e) => {
        if (isAbortError(e)) return
        setError((e as ApiError).message)
      })
      .finally(() => {
        if (!ac.signal.aborted) setLoading(false)
      })
    return () => ac.abort()
  }, [orderId])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const productById = useMemo(() => {
    const m = new Map<number, ProductDto>()
    for (const p of products ?? []) {
      if (p.id != null) m.set(p.id, p)
    }
    return m
  }, [products])

  const applyStatus = async () => {
    if (!order || !statusDraft) return
    if (statusDraft === order.status) return
    try {
      setSaving(true)
      setError(null)
      const updated = await patchOrderStatus(order.id, statusDraft)
      setOrder(updated)
      onUpdated()
    } catch (e) {
      setError((e as ApiError).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-modal-overlay" role="presentation" onMouseDown={onClose}>
      <div
        className="admin-modal ord-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ord-detail-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="admin-modal-header">
          <div>
            <div id="ord-detail-title" className="admin-modal-title">
              Order #{orderId}
            </div>
            {customerName ? (
              <p className="ord-modal-sub">Customer: {customerName}</p>
            ) : null}
          </div>
          <button type="button" className="admin-modal-close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="admin-modal-body">
          {loading ? (
            <p style={{ margin: 0, fontWeight: 700 }}>Loading…</p>
          ) : error && !order ? (
            <p style={{ margin: 0, color: '#dc2626', fontWeight: 800 }}>{error}</p>
          ) : order ? (
            <>
              {error ? (
                <p style={{ margin: '0 0 12px', color: '#dc2626', fontWeight: 800 }} role="alert">
                  {error}
                </p>
              ) : null}
              <div className="ord-detail-meta">
                <div>
                  <div className="ord-detail-label">Order date</div>
                  <div className="ord-detail-value">{formatOrderDate(order.orderDate)}</div>
                </div>
                <div>
                  <div className="ord-detail-label">Status</div>
                  <div>
                    <span className={orderStatusBadgeClass(order.status)}>{orderStatusLabel(order.status)}</span>
                  </div>
                </div>
                <div>
                  <div className="ord-detail-label">Payment</div>
                  <div className="ord-detail-value">{order.paymentStatus ?? '—'}</div>
                </div>
                <div>
                  <div className="ord-detail-label">Shipment</div>
                  <div className="ord-detail-value">{order.shipmentStatus ?? '—'}</div>
                </div>
                <div>
                  <div className="ord-detail-label">Total</div>
                  <div className="ord-detail-value">{formatMoneyUsd(order.totalAmount)}</div>
                </div>
              </div>
              <div className="ord-detail-block">
                <div className="ord-detail-label">Shipping address</div>
                <div className="ord-detail-p">{order.shippingAddress?.trim() || '—'}</div>
              </div>
              <div className="ord-detail-block">
                <div className="ord-detail-label">Billing address</div>
                <div className="ord-detail-p">{order.billingAddress?.trim() || '—'}</div>
              </div>
              <div className="ord-detail-block">
                <div className="ord-detail-label">Line items</div>
                {!order.items || order.items.length === 0 ? (
                  <p className="ord-detail-p">No line items.</p>
                ) : (
                  <div className="ds-table-wrap ord-items-wrap">
                    <table className="ds-table ord-items-table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>SKU</th>
                          <th className="ord-num">Qty</th>
                          <th className="ord-num">Unit</th>
                          <th className="ord-num">Line total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((line) => {
                          const p = productById.get(line.productId)
                          return (
                            <tr key={line.id}>
                              <td>{p?.name ?? `Product #${line.productId}`}</td>
                              <td className="ord-mono">{p?.sku ?? '—'}</td>
                              <td className="ord-num">{line.quantity}</td>
                              <td className="ord-num">{formatMoneyUsd(line.unitPrice)}</td>
                              <td className="ord-num">{formatMoneyUsd(line.totalPrice)}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              {canWrite ? (
                <div className="ord-status-row">
                  <label className="ord-detail-label" htmlFor="ord-status-select">
                    Update status
                  </label>
                  <div className="ord-status-controls">
                    <select
                      id="ord-status-select"
                      className="ds-filter-select ord-status-select"
                      value={statusDraft}
                      onChange={(e) => setStatusDraft(e.target.value as OrderStatus)}
                    >
                      {ORDER_STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="ds-btn-primary"
                      disabled={saving || !statusDraft || statusDraft === order.status}
                      onClick={() => void applyStatus()}
                    >
                      {saving ? 'Saving…' : 'Apply'}
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          ) : null}
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
