import '../Admin/adminModals.css'

type Props = {
  lineId: number
  onConfirm: () => void
  onClose: () => void
  isDeleting: boolean
}

export function OrderItemDeleteModal({ lineId, onConfirm, onClose, isDeleting }: Props) {
  return (
    <div className="admin-modal-overlay" role="presentation" onMouseDown={onClose}>
      <div
        className="admin-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="oi-del-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="admin-modal-header">
          <div id="oi-del-title" className="admin-modal-title">
            Delete order line
          </div>
          <button type="button" className="admin-modal-close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="admin-modal-body">
          <p style={{ margin: 0, fontWeight: 700, color: 'rgba(15,23,42,0.85)' }}>
            Remove line <strong>#{lineId}</strong> from the order? This cannot be undone. The server may reject the delete
            if the line is allocated or invoiced.
          </p>
        </div>
        <div className="admin-modal-actions">
          <button type="button" className="ds-btn-ghost" onClick={onClose} disabled={isDeleting}>
            Cancel
          </button>
          <button type="button" className="ds-btn-danger" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
