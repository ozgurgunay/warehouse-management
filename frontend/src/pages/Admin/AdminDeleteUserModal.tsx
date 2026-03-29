import { useEffect, useState } from 'react'

import { deleteUser } from '../../features/admin/api'
import type { User } from '../../features/admin/types'
import type { ApiError } from '../../services/apiClient'

import './adminModals.css'

export function AdminDeleteUserModal({
  user,
  onClose,
  onUserDeleted,
}: {
  user: User
  onClose: () => void
  onUserDeleted: () => void
}) {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const onConfirm = async () => {
    try {
      setIsSaving(true)
      setError(null)
      await deleteUser(user.id)
      onUserDeleted()
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
          <div className="admin-modal-title">Delete user</div>
          <button type="button" className="admin-modal-close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="admin-modal-body">
          <p style={{ margin: 0, fontWeight: 700, color: 'rgba(15,23,42,0.88)' }}>
            Soft-delete <strong>{user.username}</strong>? The account will be hidden from lists and sign-in will be
            blocked. The record stays in the database for audit.
          </p>
          {error ? <div className="admin-modal-error">{error.message}</div> : null}
        </div>

        <div className="admin-modal-actions">
          <button type="button" className="app-button-secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </button>
          <button
            type="button"
            className="app-button-primary"
            onClick={() => void onConfirm()}
            disabled={isSaving}
            style={{ background: '#b91c1c' }}
          >
            {isSaving ? 'Deleting...' : 'Delete user'}
          </button>
        </div>
      </div>
    </div>
  )
}
