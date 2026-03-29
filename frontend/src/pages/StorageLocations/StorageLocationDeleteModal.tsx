import { useEffect, useState } from 'react'

import { deleteStorageLocation } from '../../features/storage-locations/api'
import { displayLocationCode } from '../../features/storage-locations/format'
import type { StorageLocation } from '../../features/storage-locations/types'
import type { ApiError } from '../../services/apiClient'

import '../Admin/adminModals.css'

export function StorageLocationDeleteModal({
  location,
  onClose,
  onDeleted,
}: {
  location: StorageLocation
  onClose: () => void
  onDeleted: () => void
}) {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const onConfirm = async () => {
    try {
      setIsSaving(true)
      setError(null)
      await deleteStorageLocation(location.id)
      onDeleted()
      onClose()
    } catch (err) {
      setError(err as ApiError)
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className="admin-modal-overlay" role="dialog" aria-modal="true">
      <div className="admin-modal">
        <div className="admin-modal-header">
          <div className="admin-modal-title">Delete storage location</div>
          <button type="button" className="admin-modal-close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="admin-modal-body">
          <p style={{ margin: 0, fontWeight: 700, color: 'rgba(15,23,42,0.88)' }}>
            Delete <strong>{location.name}</strong>{' '}
            <span style={{ color: 'rgba(15,23,42,0.55)' }}>
              ({displayLocationCode(location)})?
            </span>{' '}
            Linked inventory rows may need to be updated first.
          </p>
          {error ? <div className="admin-modal-error">{error.message}</div> : null}
        </div>

        <div className="admin-modal-actions">
          <button
            type="button"
            className="ds-btn-ghost"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="ds-btn-danger"
            onClick={() => void onConfirm()}
            disabled={isSaving}
          >
            {isSaving ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
