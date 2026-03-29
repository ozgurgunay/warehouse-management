import { useEffect, useMemo, useState } from 'react'

import { createOrderItem } from '../../features/order-items/api'
import type { OrderDto } from '../../features/orders/types'
import type { ProductDto } from '../../features/products/types'
import { formatOrderRef } from '../../features/orders/format'
import { isAbortError, type ApiError } from '../../services/apiClient'

import '../Admin/adminModals.css'
import './orderItemsPage.css'

type Props = {
  orders: OrderDto[]
  products: ProductDto[]
  onClose: () => void
  onCreated: () => void
}

export function OrderItemCreateModal({ orders, products, onClose, onCreated }: Props) {
  const [orderId, setOrderId] = useState<number | ''>('')
  const [productId, setProductId] = useState<number | ''>('')
  const [quantity, setQuantity] = useState(1)
  const [unitPrice, setUnitPrice] = useState('')
  const [batchNo, setBatchNo] = useState('')
  const [barcode, setBarcode] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => (a.name || '').localeCompare(b.name || '')),
    [products],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const submit = async () => {
    if (orderId === '' || productId === '') {
      setError('Select an order and a product.')
      return
    }
    const up = parseFloat(unitPrice.replace(',', '.'))
    if (!Number.isFinite(up) || up < 0) {
      setError('Enter a valid unit price.')
      return
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      setError('Quantity must be a positive integer.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await createOrderItem({
        orderId,
        productId,
        quantity,
        unitPrice: up,
        batchNo: batchNo.trim() || null,
        barcode: barcode.trim() || null,
        qrCode: qrCode.trim() || null,
      })
      onCreated()
      onClose()
    } catch (e) {
      if (!isAbortError(e)) setError((e as ApiError).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-modal-overlay" role="presentation" onMouseDown={onClose}>
      <div
        className="admin-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="oi-create-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="admin-modal-header">
          <div id="oi-create-title" className="admin-modal-title">
            New order line
          </div>
          <button type="button" className="admin-modal-close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="admin-modal-body">
          {error ? (
            <p style={{ margin: '0 0 12px', color: '#dc2626', fontWeight: 800 }} role="alert">
              {error}
            </p>
          ) : null}
          <div className="oi-modal-grid">
            <div className="oi-modal-field oi-modal-field--full">
              <label htmlFor="oi-create-order">Order</label>
              <select
                id="oi-create-order"
                className="ds-filter-select"
                style={{ width: '100%' }}
                value={orderId === '' ? '' : String(orderId)}
                onChange={(e) => setOrderId(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">Select order…</option>
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {formatOrderRef(o.id)}
                    {o.orderDate ? ` · ${o.orderDate.slice(0, 10)}` : ''} · {o.status}
                  </option>
                ))}
              </select>
            </div>
            <div className="oi-modal-field oi-modal-field--full">
              <label htmlFor="oi-create-product">Product</label>
              <select
                id="oi-create-product"
                className="ds-filter-select"
                style={{ width: '100%' }}
                value={productId === '' ? '' : String(productId)}
                onChange={(e) => setProductId(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">Select product…</option>
                {sortedProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </div>
            <div className="oi-modal-field">
              <label htmlFor="oi-create-qty">Quantity</label>
              <input
                id="oi-create-qty"
                type="number"
                min={1}
                step={1}
                className="ds-search-input"
                style={{ maxWidth: 140 }}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 0)}
              />
            </div>
            <div className="oi-modal-field">
              <label htmlFor="oi-create-unit">Unit price (USD)</label>
              <input
                id="oi-create-unit"
                type="text"
                inputMode="decimal"
                className="ds-search-input"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                placeholder="0.00"
                autoComplete="off"
              />
            </div>
            <div className="oi-modal-field oi-modal-field--full">
              <label htmlFor="oi-create-batch">Batch / lot (optional)</label>
              <input
                id="oi-create-batch"
                type="text"
                className="ds-search-input"
                value={batchNo}
                onChange={(e) => setBatchNo(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div className="oi-modal-field">
              <label htmlFor="oi-create-barcode">Barcode (optional)</label>
              <input
                id="oi-create-barcode"
                type="text"
                className="ds-search-input"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div className="oi-modal-field">
              <label htmlFor="oi-create-qr">QR code (optional)</label>
              <input
                id="oi-create-qr"
                type="text"
                className="ds-search-input"
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                autoComplete="off"
              />
            </div>
          </div>
        </div>
        <div className="admin-modal-actions">
          <button type="button" className="ds-btn-ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="button" className="ds-btn-primary" disabled={saving} onClick={() => void submit()}>
            {saving ? 'Creating…' : 'Create line'}
          </button>
        </div>
      </div>
    </div>
  )
}
