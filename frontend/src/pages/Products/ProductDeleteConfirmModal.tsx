import { useEffect } from 'react'

import '../Admin/adminModals.css'

export function ProductDeleteConfirmModal({
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onClose,
  isDeleting,
}: {
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onClose: () => void
  isDeleting: boolean
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="admin-modal-overlay" role="dialog" aria-modal="true">
      <div className="admin-modal" style={{ maxWidth: 440 }}>
        <div className="admin-modal-header">
          <div className="admin-modal-title">{title}</div>
          <button type="button" className="admin-modal-close-button" onClick={onClose} disabled={isDeleting}>
            ✕
          </button>
        </div>
        <div className="admin-modal-body">
          <p style={{ margin: 0, fontWeight: 700, lineHeight: 1.45 }}>{message}</p>
        </div>
        <div className="admin-modal-actions">
          <button type="button" className="ds-btn-ghost" onClick={onClose} disabled={isDeleting}>
            Cancel
          </button>
          <button type="button" className="ds-btn-danger" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
