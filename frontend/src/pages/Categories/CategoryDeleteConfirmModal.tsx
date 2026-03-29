import '../Admin/adminModals.css'

type Props = {
  title: string
  message: string
  onConfirm: () => void
  onClose: () => void
  isDeleting: boolean
}

export function CategoryDeleteConfirmModal({
  title,
  message,
  onConfirm,
  onClose,
  isDeleting,
}: Props) {
  return (
    <div className="admin-modal-overlay" role="presentation" onMouseDown={onClose}>
      <div
        className="admin-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cat-del-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="admin-modal-header">
          <div id="cat-del-title" className="admin-modal-title">
            {title}
          </div>
          <button type="button" className="admin-modal-close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="admin-modal-body">
          <p style={{ margin: 0, fontWeight: 700, color: 'rgba(15,23,42,0.85)' }}>{message}</p>
        </div>
        <div className="admin-modal-actions">
          <button type="button" className="ds-btn-ghost" onClick={onClose} disabled={isDeleting}>
            Cancel
          </button>
          <button type="button" className="ds-btn-primary" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
