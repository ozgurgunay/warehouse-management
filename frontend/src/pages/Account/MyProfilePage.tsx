import { useEffect, useMemo, useState } from 'react'

import { useAuth } from '../../auth/AuthContext'
import { UserProfileFormFields } from '../../components/user/UserProfileFormFields'
import { updateMyProfile } from '../../features/users/api'
import { emptyProfilePayload, profileFromApi, profilePayloadForPut } from '../../features/users/profilePayload'
import type { UserConsent, UserProfilePayload } from '../../features/users/types'
import type { ApiError } from '../../services/apiClient'
import { AccountLayout } from './AccountLayout'

function safeInitialsFromUsername(username: string) {
  const trimmed = username.trim()
  if (!trimmed) return 'U'
  return trimmed.slice(0, 1).toUpperCase()
}

export function MyProfilePage() {
  const { currentUser, refreshCurrentUser } = useAuth()
  const [profileDraft, setProfileDraft] = useState<UserProfilePayload>(() => emptyProfilePayload())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!currentUser) return
    setProfileDraft(profileFromApi(currentUser.profile))
  }, [currentUser])

  const avatarLetter = useMemo(
    () => safeInitialsFromUsername(currentUser?.username ?? ''),
    [currentUser],
  )

  const onSaveProfile = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)
      await updateMyProfile(profilePayloadForPut(profileDraft))
      await refreshCurrentUser()
      setSuccess('Profile saved.')
    } catch (err) {
      setError(err as ApiError)
    } finally {
      setSaving(false)
    }
  }

  if (!currentUser) {
    return (
      <AccountLayout active="profile">
        <div className="account-page-section-title">My Profile</div>
        <p className="account-muted-value">Loading…</p>
      </AccountLayout>
    )
  }

  return (
    <AccountLayout active="profile">
      <div className="account-page-section-title">My Profile</div>

      <div className="account-card">
        <div className="account-card-header">
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div className="account-photo-block">
              <div className="account-avatar">{avatarLetter}</div>
            </div>
            <div className="account-avatar-meta">
              <div className="account-avatar-name">{currentUser.username}</div>
              <div className="account-avatar-subtitle">
                {currentUser.roleDTOs?.map((r) => r.name).join(', ') || 'User access'}
              </div>
            </div>
          </div>
        </div>
        <div className="account-hint" style={{ marginTop: 8 }}>
          Account email and username are managed by an administrator. You can update your employee profile
          below.
        </div>
        <div className="account-two-col-row" style={{ marginTop: 14 }}>
          <div className="account-form-field">
            <div className="account-form-label">Email</div>
            <div className="account-muted-value">{currentUser.email}</div>
          </div>
          <div className="account-form-field">
            <div className="account-form-label">Account status</div>
            <div className="account-muted-value">{currentUser.enabled ? 'Active' : 'Disabled'}</div>
          </div>
        </div>
      </div>

      <div className="account-card">
        <div className="account-card-header">
          <div className="app-section-title" style={{ fontSize: 14, fontWeight: 900 }}>
            Employee profile
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <UserProfileFormFields
            variant="account"
            value={profileDraft}
            onChange={setProfileDraft}
            requireFirstAndLast
          />
        </div>
        {error ? <p className="auth-error" style={{ marginTop: 12 }}>{error.message}</p> : null}
        {success ? <p className="auth-success" style={{ marginTop: 12 }}>{success}</p> : null}
        <div className="account-form-actions" style={{ marginTop: 16 }}>
          <button
            type="button"
            className="account-action-button account-action-button--primary"
            onClick={() => void onSaveProfile()}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </div>
      </div>

      <div className="account-card">
        <div className="account-card-header">
          <div className="app-section-title" style={{ fontSize: 14, fontWeight: 900 }}>
            Consent history (read-only)
          </div>
        </div>
        {!currentUser.consents || currentUser.consents.length === 0 ? (
          <div className="account-muted-value" style={{ marginTop: 12 }}>
            No consent records returned for this account.
          </div>
        ) : (
          <div style={{ overflowX: 'auto', marginTop: 12 }}>
            <table className="app-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Document version</th>
                  <th>Consented at</th>
                  <th>Withdrawn at</th>
                </tr>
              </thead>
              <tbody>
                {currentUser.consents.map((c: UserConsent) => (
                  <tr key={c.id}>
                    <td>{c.consentType}</td>
                    <td>{c.documentVersion}</td>
                    <td>{c.consentedAt ? new Date(c.consentedAt).toLocaleString() : '—'}</td>
                    <td>{c.withdrawnAt ? new Date(c.withdrawnAt).toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AccountLayout>
  )
}
