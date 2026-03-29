import { useEffect, useMemo, useState } from 'react'

import type { Role, User } from '../../features/admin/types'
import type { ApiError } from '../../services/apiClient'
import { updateUserRoles } from '../../features/admin/api'

import './adminModals.css'

export function AdminManageRoleUsersModal({
  role,
  users,
  onClose,
  onUsersUpdated,
}: {
  role: Role
  users: User[]
  onClose: () => void
  onUsersUpdated: () => void
}) {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const usersEnabled = useMemo(() => users.filter((u) => u.enabled), [users])

  const initialCheckedState = useMemo(() => {
    const map = new Map<number, boolean>()
    for (const u of usersEnabled) {
      const hasRole = u.roleDTOs.some((r) => r.id === role.id)
      map.set(u.id, hasRole)
    }
    return map
  }, [usersEnabled, role.id])

  const [checkedByUserId, setCheckedByUserId] = useState<Map<number, boolean>>(initialCheckedState)

  useEffect(() => {
    setCheckedByUserId(initialCheckedState)
  }, [initialCheckedState])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const onToggle = (userId: number, next: boolean) => {
    setCheckedByUserId((prev) => {
      const nextMap = new Map(prev)
      nextMap.set(userId, next)
      return nextMap
    })
  }

  const canRemoveRoleFromUser = (user: User) => {
    const remainingRoles = user.roleDTOs.filter((r) => r.id !== role.id)
    // Backend updateUser only changes roles when roleIds is non-empty.
    return remainingRoles.length > 0
  }

  const onSave = async () => {
    setIsSaving(true)
    setError(null)

    try {
      const tasks = []
      for (const user of usersEnabled) {
        const currentHasRole = user.roleDTOs.some((r) => r.id === role.id)
        const targetHasRole = checkedByUserId.get(user.id) ?? false

        if (currentHasRole === targetHasRole) continue

        if (currentHasRole && !targetHasRole && !canRemoveRoleFromUser(user)) {
          continue
        }

        const nextRoleIds = user.roleDTOs
          .map((r) => r.id)
          .filter((id) => {
            if (id === role.id) return targetHasRole
            return true
          })

        tasks.push(
          updateUserRoles(
            user.id,
            { username: user.username, email: user.email, enabled: user.enabled },
            nextRoleIds,
          ),
        )
      }

      await Promise.all(tasks)
      onUsersUpdated()
      onClose()
    } catch (err) {
      setError(err as ApiError)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="admin-modal-overlay" role="dialog" aria-modal="true">
      <div className="admin-modal">
        <div className="admin-modal-header">
          <div className="admin-modal-title">Manage role users</div>
          <button type="button" className="admin-modal-close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="admin-modal-body">
          <div style={{ fontWeight: 900, color: 'rgba(15,23,42,0.88)' }}>
            Role: {role.name}
          </div>
          <div style={{ fontWeight: 900, fontSize: 13, color: 'rgba(15,23,42,0.6)', marginTop: 4 }}>
            Enabled users only. Removing a role from the last role assigned to a user may be blocked by backend rules.
          </div>

          <div className="admin-checkbox-list">
            {usersEnabled.map((user) => {
              const hasRole = user.roleDTOs.some((r) => r.id === role.id)
              const canRemove = canRemoveRoleFromUser(user)
              const disabled = !hasRole ? false : !canRemove

              return (
                <label key={user.id} className="admin-checkbox-row">
                  <input
                    type="checkbox"
                    checked={checkedByUserId.get(user.id) ?? hasRole}
                    disabled={disabled || isSaving}
                    onChange={(e) => onToggle(user.id, e.target.checked)}
                  />
                  <div className="admin-checkbox-label">
                    <div className="admin-checkbox-name">{user.username}</div>
                    <div className="admin-checkbox-description">
                      {hasRole ? 'Has this role' : 'Does not have this role'}
                      {disabled ? ' (Cannot remove last role)' : ''}
                    </div>
                  </div>
                </label>
              )
            })}
          </div>

          {error ? <div className="admin-modal-error">{error.message}</div> : null}
        </div>

        <div className="admin-modal-actions">
          <button type="button" className="app-button-secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </button>
          <button type="button" className="app-button-primary" onClick={() => void onSave()} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

