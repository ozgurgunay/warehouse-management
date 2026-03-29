import { useEffect, useState } from 'react'

import { listProducts } from '../../features/products/api'
import type { ProductDto } from '../../features/products/types'
import { createStockMovement } from '../../features/stock-movements/api'
import type { MovementType } from '../../features/stock-movements/types'
import { useWarehouses } from '../../features/warehouses/hooks/useWarehouses'
import { displayWarehouseCode } from '../../features/warehouses/format'
import { isAbortError, type ApiError } from '../../services/apiClient'

import '../Admin/adminModals.css'

type Props = {
  open: boolean
  auditUsername: string
  onClose: () => void
  onCreated: () => void
}

const MOVEMENT_TYPES: { value: MovementType; label: string }[] = [
  { value: 'INBOUND', label: 'Inbound' },
  { value: 'OUTBOUND', label: 'Outbound' },
  { value: 'TRANSFER', label: 'Transfer' },
]

function toQuantityChange(type: MovementType, units: number): number {
  const n = Math.abs(Math.trunc(units))
  if (type === 'OUTBOUND') return -n
  return n
}

export function StockMovementFormModal({ open, auditUsername, onClose, onCreated }: Props) {
  const { data: warehouses } = useWarehouses()
  const [products, setProducts] = useState<ProductDto[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [movementType, setMovementType] = useState<MovementType>('INBOUND')
  const [productId, setProductId] = useState<number | ''>('')
  const [warehouseId, setWarehouseId] = useState<number | ''>('')
  const [units, setUnits] = useState<number | ''>('')
  const [reason, setReason] = useState('')

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
    listProducts(ac.signal)
      .then((data) => {
        if (ac.signal.aborted) return
        setProducts(data)
      })
      .catch((e) => {
        if (isAbortError(e)) return
        setLoadError((e as ApiError).message)
        setProducts(null)
      })
    return () => ac.abort()
  }, [open])

  useEffect(() => {
    if (!open) {
      setMovementType('INBOUND')
      setProductId('')
      setWarehouseId('')
      setUnits('')
      setReason('')
      setSubmitError(null)
      setLoadError(null)
    }
  }, [open])

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError(null)
    if (productId === '' || warehouseId === '' || units === '' || units <= 0) {
      setSubmitError('Product, warehouse, and a positive quantity are required.')
      return
    }
    const qc = toQuantityChange(movementType, Number(units))
    setSubmitting(true)
    try {
      await createStockMovement({
        movementType,
        reason: reason.trim() || null,
        quantityChange: qc,
        productId: Number(productId),
        warehouseId: Number(warehouseId),
        createdBy: auditUsername,
        updatedBy: auditUsername,
      })
      onCreated()
      onClose()
    } catch (err) {
      setSubmitError((err as ApiError).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="admin-modal-overlay" role="presentation" onMouseDown={(ev) => ev.target === ev.currentTarget && onClose()}>
      <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="sm-modal-title">
        <div className="admin-modal-header">
          <div id="sm-modal-title" className="admin-modal-title">
            Record stock movement
          </div>
          <button type="button" className="admin-modal-close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="admin-modal-body">
            <div className="admin-modal-field-grid">
              {loadError ? (
                <p style={{ color: '#dc2626', fontWeight: 800, margin: 0 }}>Could not load products: {loadError}</p>
              ) : null}
              {submitError ? (
                <p style={{ color: '#dc2626', fontWeight: 800, margin: 0 }}>{submitError}</p>
              ) : null}
              <div>
                <div className="admin-label">Movement type</div>
                <select
                  className="ds-filter-select"
                  style={{ width: '100%' }}
                  value={movementType}
                  onChange={(e) => setMovementType(e.target.value as MovementType)}
                >
                  {MOVEMENT_TYPES.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
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
                <div className="admin-label">Warehouse</div>
                <select
                  className="ds-filter-select"
                  style={{ width: '100%' }}
                  required
                  value={warehouseId === '' ? '' : String(warehouseId)}
                  onChange={(e) => setWarehouseId(e.target.value === '' ? '' : Number(e.target.value))}
                >
                  <option value="">Select warehouse…</option>
                  {(warehouses ?? []).map((w) => (
                    <option key={w.id} value={w.id}>
                      {displayWarehouseCode(w)} — {w.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="admin-label">Quantity (units)</div>
                <input
                  type="number"
                  className="admin-input"
                  min={1}
                  step={1}
                  required
                  value={units === '' ? '' : units}
                  onChange={(e) => {
                    const v = e.target.value
                    setUnits(v === '' ? '' : Number(v))
                  }}
                />
                <div style={{ fontSize: 12, color: 'rgba(15,23,42,0.55)', marginTop: 6 }}>
                  Outbound movements are stored as negative quantity change.
                </div>
              </div>
              <div>
                <div className="admin-label">Reason (optional)</div>
                <input
                  type="text"
                  className="admin-input"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. PO receipt, customer order"
                  autoComplete="off"
                />
              </div>
            </div>
          </div>
          <div className="admin-modal-actions">
            <button type="button" className="ds-btn-ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="ds-btn-primary" disabled={submitting || !products?.length}>
              {submitting ? 'Saving…' : 'Save movement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
