import { useEffect, useMemo, useState } from 'react'

import type { Role } from '../../features/admin/types'

import { createRole } from '../../features/admin/api'
import type { ApiError } from '../../services/apiClient'

import './adminModals.css'

export function AdminCreateRoleModal({
  onClose,
  onRoleCreated,
}: {
  onClose: () => void
  onRoleCreated: (role: Role) => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const canSave = useMemo(() => name.trim().length > 0 && description.trim().length > 0, [name, description])

  const onSubmit = async () => {
    if (!canSave) return
    try {
      setIsSaving(true)
      setError(null)

      const created = await createRole(
        { name: name.trim(), description: description.trim() },
      )
      onRoleCreated(created)
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
          <div className="admin-modal-title">Add new role</div>
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
                placeholder="e.g., ROLE_WAREHOUSE_MANAGER"
              />
            </label>

            <label style={{ display: 'grid', gap: 6 }}>
              <div className="admin-label">Description</div>
              <input
                className="admin-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short role description"
              />
            </label>
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
            onClick={onSubmit}
            disabled={!canSave || isSaving}
          >
            {isSaving ? 'Saving...' : 'Create role'}
          </button>
        </div>
      </div>
    </div>
  )
}

