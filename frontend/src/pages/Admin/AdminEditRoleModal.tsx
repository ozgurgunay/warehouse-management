import { useEffect, useMemo, useState } from 'react'

import type { Role } from '../../features/admin/types'
import type { ApiError } from '../../services/apiClient'

import { updateRole } from '../../features/admin/api'

import './adminModals.css'

export function AdminEditRoleModal({
  role,
  onClose,
  onRoleUpdated,
}: {
  role: Role
  onClose: () => void
  onRoleUpdated: (updated: Role) => void
}) {
  const [name, setName] = useState(role.name)
  const [description, setDescription] = useState(role.description ?? '')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  useEffect(() => {
    setName(role.name)
    setDescription(role.description ?? '')
  }, [role])

  const canSave = useMemo(() => name.trim().length > 0 && description.trim().length > 0, [name, description])

  const onSave = async () => {
    if (!canSave) return
    try {
      setIsSaving(true)
      setError(null)

      const updated = await updateRole(
        role.id,
        { name: name.trim(), description: description.trim() },
      )
      onRoleUpdated(updated)
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
          <div className="admin-modal-title">Edit role</div>
          <button type="button" className="admin-modal-close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="admin-modal-body">
          <div className="admin-modal-field-grid">
            <label style={{ display: 'grid', gap: 6 }}>
              <div className="admin-label">Role name</div>
              <input
                className="admin-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>

            <label style={{ display: 'grid', gap: 6 }}>
              <div className="admin-label">Description</div>
              <input
                className="admin-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
          </div>

          {error ? <div className="admin-modal-error">{error.message}</div> : null}
        </div>

        <div className="admin-modal-actions">
          <button type="button" className="app-button-secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </button>
          <button
            type="button"
            className="app-button-primary"
            onClick={onSave}
            disabled={!canSave || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

