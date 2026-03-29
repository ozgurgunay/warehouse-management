import { useMemo, useState } from 'react'

import { useAdminRoles } from '../../features/admin/hooks/useAdminRoles'
import { useAdminUsers } from '../../features/admin/hooks/useAdminUsers'
import { useAuth } from '../../auth/AuthContext'
import type { Role, User } from '../../features/admin/types'
import { getRoles, getUsers } from '../../features/admin/api'

import { AdminAssignRolesModal } from './AdminAssignRolesModal'
import { AdminCreateRoleModal } from './AdminCreateRoleModal'
import { AdminCreateUserModal } from './AdminCreateUserModal'
import { AdminDeleteRoleModal } from './AdminDeleteRoleModal'
import { AdminDeleteUserModal } from './AdminDeleteUserModal'
import { AdminToggleUserEnabledModal } from './AdminToggleUserEnabledModal'
import { AdminEditRoleModal } from './AdminEditRoleModal'
import { AdminEditUserProfileModal } from './AdminEditUserProfileModal'
import { AdminManageRoleUsersModal } from './AdminManageRoleUsersModal'

import './adminPage.css'

export function AdminHomePage() {
  const { currentUser, isLoading: authLoading } = useAuth()

  const { data: users, isLoading: usersLoading, error: usersError } =
    useAdminUsers()
  const { data: roles, isLoading: rolesLoading, error: rolesError } =
    useAdminRoles()

  const [usersOverride, setUsersOverride] = useState<User[] | null>(null)
  const [rolesOverride, setRolesOverride] = useState<Role[] | null>(null)
  const [createRoleOpen, setCreateRoleOpen] = useState(false)
  const [editRole, setEditRole] = useState<Role | null>(null)
  const [createUserOpen, setCreateUserOpen] = useState(false)
  const [assignUser, setAssignUser] = useState<User | null>(null)
  const [manageRoleUsers, setManageRoleUsers] = useState<Role | null>(null)
  const [toggleEnabledUser, setToggleEnabledUser] = useState<{
    user: User
    targetEnabled: boolean
  } | null>(null)
  const [deleteUserTarget, setDeleteUserTarget] = useState<User | null>(null)
  const [deleteRoleTarget, setDeleteRoleTarget] = useState<Role | null>(null)
  const [profileEditUser, setProfileEditUser] = useState<User | null>(null)
  const [adminActionError, setAdminActionError] = useState<string | null>(null)

  /** Full list from API (used for role–user matrix; includes current user). */
  const usersToRender = usersOverride ?? users
  const rolesToRender = rolesOverride ?? roles

  /** Administration table: hide the signed-in admin (they manage their account under My Profile). */
  const usersForAdminTable = useMemo(() => {
    if (!usersToRender || authLoading) return null
    const myId = currentUser?.id
    if (myId == null) return usersToRender
    return usersToRender.filter((u) => u.id !== myId)
  }, [usersToRender, currentUser?.id, authLoading])

  const refreshUsers = async () => {
    setAdminActionError(null)
    try {
      const updatedUsers = await getUsers()
      setUsersOverride(updatedUsers)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to refresh users'
      setAdminActionError(message)
    }
  }

  const refreshRoles = async () => {
    setAdminActionError(null)
    try {
      const updatedRoles = await getRoles()
      setRolesOverride(updatedRoles)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to refresh roles'
      setAdminActionError(message)
    }
  }

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-page-kicker">ADMINISTRATION</div>
        <div className="admin-page-title">USER & ROLE MANAGEMENT</div>
      </div>

      {adminActionError ? (
        <div style={{ marginTop: 10, color: '#dc2626', fontWeight: 900 }}>
          {adminActionError}
        </div>
      ) : null}

      <div className="admin-content-grid">
        <div className="app-panel admin-users-panel">
          <div className="admin-panel-header">
            <div>
              <div className="admin-panel-title">ACTIVE SYSTEM USERS</div>
              <div className="admin-panel-subtitle">Account status and role access</div>
              <div className="admin-panel-subtitle" style={{ marginTop: 4, fontWeight: 700, opacity: 0.75 }}>
                Your account is not listed here — use My Profile to update your own data.
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="admin-panel-subtitle">
                {usersForAdminTable ? `${usersForAdminTable.length} users` : '—'}
              </div>
              <button
                type="button"
                className="admin-create-user-button"
                onClick={() => setCreateUserOpen(true)}
                disabled={usersLoading || authLoading}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M12 5v14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M5 12h14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                Create User
              </button>
            </div>
          </div>

          {usersLoading || authLoading ? (
            <div className="app-muted" style={{ fontWeight: 900 }}>Loading users...</div>
          ) : usersError ? (
            <div style={{ color: '#dc2626', fontWeight: 900 }}>
              Failed to load users: {usersError.message}
            </div>
          ) : !usersForAdminTable || usersForAdminTable.length === 0 ? (
            <div className="app-muted" style={{ fontWeight: 900 }}>
              {usersToRender && usersToRender.length > 0
                ? 'No other users to show.'
                : 'No users found.'}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="app-table">
                <thead>
                  <tr>
                    <th>USERNAME</th>
                    <th>EMAIL ADDRESS</th>
                    <th>ENABLED</th>
                    <th>SYSTEM ROLES</th>
                    <th style={{ width: 240 }}>MANAGE</th>
                  </tr>
                </thead>
                <tbody>
                  {usersForAdminTable.map((u) => (
                    <tr key={u.id} className="app-rows-divider">
                      <td>{u.username}</td>
                      <td>{u.email}</td>
                      <td>{u.enabled ? 'Yes' : 'No'}</td>
                      <td>
                        {u.roleDTOs && u.roleDTOs.length > 0 ? (
                          <span style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {u.roleDTOs.map((r) => (
                              <span
                                key={r.id}
                                className={
                                  r.name === 'ROLE_ADMIN'
                                    ? 'admin-role-chip'
                                    : 'admin-role-chip admin-role-chip--muted'
                                }
                              >
                                {r.name}
                              </span>
                            ))}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>
                        {u.enabled ? (
                          <div className="admin-manage-icons">
                            <button
                              type="button"
                              className="admin-icon-button"
                              onClick={() => setAssignUser(u)}
                              aria-label="Assign roles"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path
                                  d="M4 20h4l10.5-10.5a2 2 0 0 0 0-3L16 3.5a2 2 0 0 0-3 0L2.5 14A2 2 0 0 0 2 15.5V20Z"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinejoin="round"
                                  strokeLinecap="round"
                                />
                                <path
                                  d="M14 6l4 4"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </button>
                            <button
                              type="button"
                              className="admin-icon-button"
                              onClick={() => setProfileEditUser(u)}
                              aria-label="Edit user profile"
                              title="Edit profile (HR / PII)"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path
                                  d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />
                                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                                <path
                                  d="M19 8v6M22 11h-6"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </button>
                            <button
                              type="button"
                              className="admin-icon-button"
                              onClick={() => setDeleteUserTarget(u)}
                              aria-label="Delete user"
                              title="Soft-delete user"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path
                                  d="M3 6h18"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />
                                <path
                                  d="M8 6V4h8v2"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M19 6l-1 14H6L5 6"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M10 11v6M14 11v6"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </button>
                            <button
                              type="button"
                              className="admin-status-icon admin-status-icon--disabled"
                              onClick={() =>
                                setToggleEnabledUser({ user: u, targetEnabled: false })
                              }
                              aria-label="Disable user"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path
                                  d="M12 15a3 3 0 0 0 3-3V8a3 3 0 0 0-6 0v4a3 3 0 0 0 3 3Z"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M19 12a7 7 0 1 1-14 0"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  opacity="0.3"
                                />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <div className="admin-manage-icons">
                            <button
                              type="button"
                              className="admin-icon-button"
                              onClick={() => setProfileEditUser(u)}
                              aria-label="Edit user profile"
                              title="Edit profile (HR / PII)"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path
                                  d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />
                                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                                <path
                                  d="M19 8v6M22 11h-6"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </button>
                            <button
                              type="button"
                              className="admin-icon-button"
                              onClick={() => setDeleteUserTarget(u)}
                              aria-label="Delete user"
                              title="Soft-delete user"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path
                                  d="M3 6h18"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />
                                <path
                                  d="M8 6V4h8v2"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M19 6l-1 14H6L5 6"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M10 11v6M14 11v6"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </button>
                            <button
                              type="button"
                              className="admin-status-icon admin-status-icon--enabled"
                              onClick={() =>
                                setToggleEnabledUser({ user: u, targetEnabled: true })
                              }
                              aria-label="Enable user"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                aria-hidden="true"
                              >
                                <path
                                  d="M20 6L9 17l-5-5"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="admin-right-column">
          <div className="app-panel admin-roles-panel">
            <div className="admin-panel-header">
              <div>
                <div className="admin-panel-title">SYSTEM ROLES CONFIGURATION</div>
                <div className="admin-panel-subtitle">
                  {rolesToRender ? `${rolesToRender.length} roles` : '—'}
                </div>
              </div>
            </div>

            {rolesLoading ? (
              <div className="app-muted" style={{ fontWeight: 900 }}>
                Loading roles...
              </div>
            ) : rolesError ? (
              <div style={{ color: '#dc2626', fontWeight: 900 }}>
                Failed to load roles: {rolesError.message}
              </div>
            ) : !rolesToRender || rolesToRender.length === 0 ? (
              <div className="app-muted" style={{ fontWeight: 900 }}>
                No roles found.
              </div>
            ) : (
              <div className="admin-roles-grid">
                {rolesToRender.map((r) => (
                  <div className="admin-role-card" key={r.id}>
                    <div>
                      <div className="admin-role-card-title-row">
                        <span className="admin-role-card-badge">{r.name}</span>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button
                            type="button"
                            className="admin-role-edit-button"
                            aria-label={`Edit role ${r.name}`}
                            onClick={() => setEditRole(r)}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              aria-hidden="true"
                            >
                              <path
                                d="M12 20h9"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                              <path
                                d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                          <button
                            type="button"
                            className="admin-role-edit-button"
                            aria-label={`Delete role ${r.name}`}
                            title="Soft-delete role"
                            onClick={() => setDeleteRoleTarget(r)}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <path
                                d="M3 6h18"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                              <path
                                d="M8 6V4h8v2"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M19 6l-1 14H6L5 6"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="admin-role-edit-button"
                      aria-label={`Manage users for role ${r.name}`}
                      onClick={() => setManageRoleUsers(r)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M12 16v-4"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M12 8h.01"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                        <path
                          d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          opacity="0.3"
                        />
                      </svg>
                    </button>
                    <div className="admin-role-card-description">
                      {r.description ?? '—'}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="admin-add-role-footer">
              <button
                type="button"
                className="admin-add-role-button"
                onClick={() => setCreateRoleOpen(true)}
                disabled={rolesLoading}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 5v14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M5 12h14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                Add new role
              </button>
            </div>
          </div>

          <div className="admin-security-panel">
            <div className="admin-security-title">SECURITY AUDIT ACTIVE</div>
            <div className="admin-security-body">
              All administrative actions are logged in the facility ledger with high-precision timestamps.
            </div>
          </div>
        </div>
      </div>

      {createRoleOpen ? (
        <AdminCreateRoleModal
          onClose={() => setCreateRoleOpen(false)}
          onRoleCreated={(created) => {
            setRolesOverride((prev) => {
              // Merge with the list from the hook when no override exists yet (avoid replacing all roles with only the new one).
              const base = prev ?? roles ?? []
              return [...base, created]
            })
          }}
        />
      ) : null}

      {editRole ? (
        <AdminEditRoleModal
          role={editRole}
          onClose={() => setEditRole(null)}
          onRoleUpdated={(updated) => {
            setRolesOverride((prev) => {
              const base = prev ?? rolesToRender ?? []
              return base.map((r) => (r.id === updated.id ? updated : r))
            })
          }}
        />
      ) : null}

      {manageRoleUsers && usersToRender ? (
        <AdminManageRoleUsersModal
          role={manageRoleUsers}
          users={usersToRender}
          onClose={() => setManageRoleUsers(null)}
          onUsersUpdated={() => {
            void refreshUsers()
          }}
        />
      ) : null}

      {createUserOpen ? (
        <AdminCreateUserModal
          onClose={() => setCreateUserOpen(false)}
          onUserCreated={() => {
            void refreshUsers()
          }}
        />
      ) : null}

      {deleteUserTarget ? (
        <AdminDeleteUserModal
          user={deleteUserTarget}
          onClose={() => setDeleteUserTarget(null)}
          onUserDeleted={() => {
            void refreshUsers()
          }}
        />
      ) : null}

      {deleteRoleTarget ? (
        <AdminDeleteRoleModal
          role={deleteRoleTarget}
          onClose={() => setDeleteRoleTarget(null)}
          onRoleDeleted={() => {
            void refreshRoles()
            void refreshUsers()
          }}
        />
      ) : null}

      {assignUser && rolesToRender ? (
        <AdminAssignRolesModal
          user={assignUser}
          roles={rolesToRender}
          onClose={() => setAssignUser(null)}
          onRolesAssigned={() => {
            void refreshUsers()
          }}
        />
      ) : null}

      {toggleEnabledUser ? (
        <AdminToggleUserEnabledModal
          user={toggleEnabledUser.user}
          targetEnabled={toggleEnabledUser.targetEnabled}
          onClose={() => setToggleEnabledUser(null)}
          onUserUpdated={() => {
            void refreshUsers()
          }}
        />
      ) : null}

      {profileEditUser ? (
        <AdminEditUserProfileModal
          userId={profileEditUser.id}
          username={profileEditUser.username}
          onClose={() => setProfileEditUser(null)}
          onSaved={() => {
            void refreshUsers()
          }}
        />
      ) : null}
    </div>
  )
}

