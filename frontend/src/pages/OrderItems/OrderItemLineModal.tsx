import { useEffect, useState } from 'react'

import { useAuth } from '../../auth/AuthContext'
import { getOrderItem, updateOrderItem } from '../../features/order-items/api'
import { formatMoneyUsd, formatOrderRef } from '../../features/orders/format'
import type { OrderItemDto } from '../../features/orders/types'
import { isAbortError, type ApiError } from '../../services/apiClient'

import '../Admin/adminModals.css'
import './orderItemsPage.css'

type Props = {
  lineId: number
  productLabel: string
  skuLabel: string
  onClose: () => void
  onSaved: () => void
}

export function OrderItemLineModal({ lineId, productLabel, skuLabel, onClose, onSaved }: Props) {
  const { hasCapability } = useAuth()
  const canWrite = hasCapability('sales.write')

  const [row, setRow] = useState<OrderItemDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [quantity, setQuantity] = useState(1)
  const [unitPrice, setUnitPrice] = useState('')
  const [batchNo, setBatchNo] = useState('')
  const [barcode, setBarcode] = useState('')
  const [qrCode, setQrCode] = useState('')

  useEffect(() => {
    const ac = new AbortController()
    setLoading(true)
    setError(null)
    getOrderItem(lineId, ac.signal)
      .then((r) => {
        if (ac.signal.aborted) return
        setRow(r)
        setQuantity(r.quantity)
        setUnitPrice(r.unitPrice != null ? String(r.unitPrice) : '')
        setBatchNo(r.batchNo?.trim() ?? '')
        setBarcode(r.barcode?.trim() ?? '')
        setQrCode(r.qrCode?.trim() ?? '')
      })
      .catch((e) => {
        if (isAbortError(e)) return
        setError((e as ApiError).message)
      })
      .finally(() => {
        if (!ac.signal.aborted) setLoading(false)
      })
    return () => ac.abort()
  }, [lineId])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const apply = async () => {
    if (!row || !canWrite) return
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
      const payload: OrderItemDto = {
        ...row,
        quantity,
        unitPrice: up,
        totalPrice: up * quantity,
        batchNo: batchNo.trim() || null,
        barcode: barcode.trim() || null,
        qrCode: qrCode.trim() || null,
      }
      await updateOrderItem(row.id, payload)
      onSaved()
      onClose()
    } catch (e) {
      setError((e as ApiError).message)
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
        aria-labelledby="oi-line-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="admin-modal-header">
          <div>
            <div id="oi-line-title" className="admin-modal-title">
              Line #{lineId}
            </div>
            <p style={{ margin: '6px 0 0', fontSize: 13, fontWeight: 700, color: 'rgba(15,23,42,0.55)' }}>
              Order {row ? formatOrderRef(row.orderId) : '…'} · {productLabel}
              {skuLabel ? ` · ${skuLabel}` : ''}
            </p>
          </div>
          <button type="button" className="admin-modal-close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="admin-modal-body">
          {loading ? (
            <p style={{ margin: 0, fontWeight: 700 }}>Loading…</p>
          ) : error && !row ? (
            <p style={{ margin: 0, color: '#dc2626', fontWeight: 800 }}>{error}</p>
          ) : row ? (
            <>
              {error ? (
                <p style={{ margin: '0 0 12px', color: '#dc2626', fontWeight: 800 }} role="alert">
                  {error}
                </p>
              ) : null}
              <div className="oi-modal-grid">
                <div className="oi-modal-field">
                  <label htmlFor="oi-qty">Quantity</label>
                  <input
                    id="oi-qty"
                    type="number"
                    min={1}
                    step={1}
                    className="ds-search-input"
                    style={{ maxWidth: 140 }}
                    value={quantity}
                    disabled={!canWrite}
                    onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 0)}
                  />
                </div>
                <div className="oi-modal-field">
                  <label htmlFor="oi-unit">Unit price (USD)</label>
                  <input
                    id="oi-unit"
                    type="text"
                    inputMode="decimal"
                    className="ds-search-input"
                    value={unitPrice}
                    disabled={!canWrite}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    autoComplete="off"
                  />
                </div>
                <div className="oi-modal-field oi-modal-field--full">
                  <label htmlFor="oi-batch">Batch / lot</label>
                  <input
                    id="oi-batch"
                    type="text"
                    className="ds-search-input"
                    value={batchNo}
                    disabled={!canWrite}
                    onChange={(e) => setBatchNo(e.target.value)}
                    autoComplete="off"
                  />
                </div>
                <div className="oi-modal-field">
                  <label htmlFor="oi-barcode">Barcode</label>
                  <input
                    id="oi-barcode"
                    type="text"
                    className="ds-search-input"
                    value={barcode}
                    disabled={!canWrite}
                    onChange={(e) => setBarcode(e.target.value)}
                    autoComplete="off"
                  />
                </div>
                <div className="oi-modal-field">
                  <label htmlFor="oi-qr">QR code</label>
                  <input
                    id="oi-qr"
                    type="text"
                    className="ds-search-input"
                    value={qrCode}
                    disabled={!canWrite}
                    onChange={(e) => setQrCode(e.target.value)}
                    autoComplete="off"
                  />
                </div>
              </div>
              <p style={{ margin: '14px 0 0', fontSize: 13, fontWeight: 800, color: 'var(--ds-muted)' }}>
                Line total:{' '}
                {formatMoneyUsd(
                  Number.isFinite(parseFloat(unitPrice.replace(',', '.')))
                    ? parseFloat(unitPrice.replace(',', '.')) * quantity
                    : row.totalPrice,
                )}
              </p>
            </>
          ) : null}
        </div>
        <div className="admin-modal-actions">
          {canWrite && row ? (
            <button type="button" className="ds-btn-primary" disabled={saving || loading} onClick={() => void apply()}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          ) : null}
          <button type="button" className={canWrite && row ? 'ds-btn-ghost' : 'ds-btn-primary'} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
