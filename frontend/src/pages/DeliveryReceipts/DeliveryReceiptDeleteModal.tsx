import { useEffect, useState } from 'react'

import { deleteDeliveryReceipt } from '../../features/delivery-receipts/api'
import type { DeliveryReceiptDto } from '../../features/delivery-receipts/types'
import type { ApiError } from '../../services/apiClient'

import '../Admin/adminModals.css'

type Props = {
  open: boolean
  row: DeliveryReceiptDto | null
  onClose: () => void
  onDeleted: () => void
}

export function DeliveryReceiptDeleteModal({ open, row, onClose, onDeleted }: Props) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  useEffect(() => {
    if (!open) setError(null)
  }, [open])

  if (!open || !row) return null
  const rowId = row.id

  async function handleDelete() {
    setError(null)
    setDeleting(true)
    try {
      await deleteDeliveryReceipt(rowId)
      onDeleted()
      onClose()
    } catch (e) {
      setError((e as ApiError).message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div
      className="admin-modal-overlay"
      role="presentation"
      onMouseDown={(ev) => ev.target === ev.currentTarget && onClose()}
    >
      <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="dr-delete-title">
        <div className="admin-modal-header">
          <div id="dr-delete-title" className="admin-modal-title">
            Delete delivery receipt
          </div>
          <button type="button" className="admin-modal-close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="admin-modal-body">
          {error ? <p style={{ color: '#dc2626', marginTop: 0, fontWeight: 800 }}>{error}</p> : null}
          <p style={{ marginTop: 0 }}>
            Delete receipt <strong>#{row.id}</strong> for shipment{' '}
            <strong>{row.shipmentId != null ? `#${row.shipmentId}` : '—'}</strong>?
          </p>
          <p className="app-muted" style={{ marginBottom: 0 }}>
            This action removes POD metadata. Shipment status remains unchanged.
          </p>
        </div>
        <div className="admin-modal-actions">
          <button type="button" className="ds-btn-ghost" onClick={onClose} disabled={deleting}>
            Cancel
          </button>
          <button type="button" className="ds-btn-danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
