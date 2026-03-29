import { useEffect, useState } from 'react'

import { deleteRole } from '../../features/admin/api'
import type { Role } from '../../features/admin/types'
import type { ApiError } from '../../services/apiClient'

import './adminModals.css'

const SYSTEM_ROLES = new Set(['ROLE_USER', 'ROLE_ADMIN'])

export function AdminDeleteRoleModal({
  role,
  onClose,
  onRoleDeleted,
}: {
  role: Role
  onClose: () => void
  onRoleDeleted: () => void
}) {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const isSystemRole = SYSTEM_ROLES.has(role.name)

  const onConfirm = async () => {
    if (isSystemRole) return
    try {
      setIsSaving(true)
      setError(null)
      await deleteRole(role.id)
      onRoleDeleted()
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
          <div className="admin-modal-title">Delete role</div>
          <button type="button" className="admin-modal-close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="admin-modal-body">
          {isSystemRole ? (
            <p style={{ margin: 0, fontWeight: 700, color: 'rgba(15,23,42,0.88)' }}>
              System roles <strong>ROLE_USER</strong> and <strong>ROLE_ADMIN</strong> cannot be deleted.
            </p>
          ) : (
            <p style={{ margin: 0, fontWeight: 700, color: 'rgba(15,23,42,0.88)' }}>
              Soft-delete role <strong>{role.name}</strong>? It will disappear from lists and be removed from all users.
              The row is kept in the database for audit.
            </p>
          )}
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
            disabled={isSaving || isSystemRole}
            style={{ background: '#b91c1c' }}
          >
            {isSaving ? 'Deleting...' : 'Delete role'}
          </button>
        </div>
      </div>
    </div>
  )
}
