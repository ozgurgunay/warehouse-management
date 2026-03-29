import { useEffect, useMemo, useState } from 'react'

import type { Role, User } from '../../features/admin/types'
import type { ApiError } from '../../services/apiClient'
import { updateUserEnabled } from '../../features/admin/api'

import './adminModals.css'

export function AdminToggleUserEnabledModal({
  user,
  targetEnabled,
  onClose,
  onUserUpdated,
}: {
  user: User
  targetEnabled: boolean
  onClose: () => void
  onUserUpdated: () => void
}) {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const roleIds = useMemo(() => user.roleDTOs.map((r: Role) => r.id), [user])

  const title = targetEnabled ? 'Activate user' : 'Disable user'
  const confirmText = targetEnabled
    ? 'This will enable the account and allow the user to sign in.'
    : 'This will disable the account. The user will not be able to sign in.'

  const onConfirm = async () => {
    try {
      setIsSaving(true)
      setError(null)
      await updateUserEnabled(
        user.id,
        { username: user.username, email: user.email },
        targetEnabled,
        roleIds,
      )
      onUserUpdated()
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
          <div className="admin-modal-title">{title}</div>
          <button type="button" className="admin-modal-close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="admin-modal-body">
          <div style={{ fontWeight: 900, color: 'rgba(15,23,42,0.88)', marginBottom: 6 }}>
            User: {user.username}
          </div>
          <div style={{ fontWeight: 900, fontSize: 13, color: 'rgba(15,23,42,0.6)' }}>
            {confirmText}
          </div>

          {error ? <div className="admin-modal-error">{error.message}</div> : null}
        </div>

        <div className="admin-modal-actions">
          <button
            type="button"
            className="app-button-secondary"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="app-button-primary"
            onClick={onConfirm}
            disabled={isSaving}
          >
            {isSaving ? 'Please wait...' : targetEnabled ? 'Enable' : 'Disable'}
          </button>
        </div>
      </div>
    </div>
  )
}

