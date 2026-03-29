import { useEffect, useMemo, useState } from 'react'

import type { Role, User } from '../../features/admin/types'

import { updateUserRoles } from '../../features/admin/api'
import type { ApiError } from '../../services/apiClient'

import './adminModals.css'

export function AdminAssignRolesModal({
  user,
  roles,
  onClose,
  onRolesAssigned,
}: {
  user: User
  roles: Role[]
  onClose: () => void
  onRolesAssigned: () => void
}) {
  const initialRoleIds = useMemo(() => new Set(user.roleDTOs.map((r) => r.id)), [user])
  const [selectedRoleIds, setSelectedRoleIds] = useState<Set<number>>(initialRoleIds)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const selectedRolesCount = selectedRoleIds.size

  const toggleRole = (roleId: number) => {
    setSelectedRoleIds((prev) => {
      const next = new Set(prev)
      if (next.has(roleId)) next.delete(roleId)
      else next.add(roleId)
      return next
    })
  }

  const onSave = async () => {
    if (selectedRolesCount === 0) return
    try {
      setIsSaving(true)
      setError(null)

      const selectedIdsArray = Array.from(selectedRoleIds)
      await updateUserRoles(
        user.id,
        { username: user.username, email: user.email, enabled: user.enabled },
        selectedIdsArray,
      )

      onRolesAssigned()
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
          <div className="admin-modal-title">Assign roles</div>
          <button type="button" className="admin-modal-close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="admin-modal-body">
          <div style={{ fontWeight: 900, color: 'rgba(15,23,42,0.88)', marginBottom: 6 }}>
            User: {user.username}
          </div>
          <div style={{ fontWeight: 900, fontSize: 13, color: 'rgba(15,23,42,0.6)' }}>
            Current roles: {user.roleDTOs.length > 0 ? user.roleDTOs.map((r) => r.name).join(', ') : '—'}
          </div>

          <div className="admin-checkbox-list">
            {roles.map((role) => {
              const checked = selectedRoleIds.has(role.id)
              return (
                <label key={role.id} className="admin-checkbox-row">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleRole(role.id)}
                  />
                  <div className="admin-checkbox-label">
                    <div className="admin-checkbox-name">{role.name}</div>
                    <div className="admin-checkbox-description">
                      {role.description ?? '—'}
                    </div>
                  </div>
                </label>
              )
            })}
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
            onClick={onSave}
            disabled={selectedRoleIds.size === 0 || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save roles'}
          </button>
        </div>
      </div>
    </div>
  )
}

