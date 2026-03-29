import { useEffect, useMemo, useState } from 'react'

import { UserProfileFormFields } from '../../components/user/UserProfileFormFields'
import { registerUser } from '../../features/users/api'
import {
  emptyProfilePayload,
  profilePayloadForUserCreate,
  sanitizeProfileForApi,
} from '../../features/users/profilePayload'
import type { UserProfilePayload } from '../../features/users/types'
import type { ApiError } from '../../services/apiClient'

import './adminModals.css'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function AdminCreateUserModal({
  onClose,
  onUserCreated,
}: {
  onClose: () => void
  onUserCreated: () => void
}) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showProfile, setShowProfile] = useState(false)
  const [profileDraft, setProfileDraft] = useState<UserProfilePayload>(() => emptyProfilePayload())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const emailLooksValid = useMemo(() => EMAIL_PATTERN.test(email.trim()), [email])

  const canSubmit = useMemo(() => {
    const firstOk = (profileDraft.firstName?.trim() ?? '').length > 0
    const lastOk = (profileDraft.lastName?.trim() ?? '').length > 0
    return (
      username.trim().length > 0 &&
      email.trim().length > 0 &&
      emailLooksValid &&
      password.length > 0 &&
      password === confirmPassword &&
      firstOk &&
      lastOk
    )
  }, [username, email, password, confirmPassword, emailLooksValid, profileDraft.firstName, profileDraft.lastName])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const onSubmit = async () => {
    if (!canSubmit) return
    try {
      setIsSubmitting(true)
      setError(null)

      const profileForCreate = profilePayloadForUserCreate(profileDraft, showProfile)
      const profilePayload = sanitizeProfileForApi(profileForCreate)
      if (!profilePayload) {
        setError({
          status: 400,
          message: 'First name and last name are required.',
        })
        return
      }

      await registerUser({
        username: username.trim(),
        email: email.trim(),
        password,
        consents: [],
        profile: profilePayload,
      })

      onUserCreated()
      onClose()
    } catch (err) {
      setError(err as ApiError)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="admin-modal-overlay" role="dialog" aria-modal="true">
      <div className="admin-modal" style={{ maxWidth: 720, maxHeight: '92vh', overflow: 'auto' }}>
        <div className="admin-modal-header">
          <div className="admin-modal-title">Create user</div>
          <button type="button" className="admin-modal-close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="admin-modal-body">
          <div className="admin-modal-field-grid">
            <label style={{ display: 'grid', gap: 6 }}>
              <div className="admin-label">Username</div>
              <input
                className="admin-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g., john.smith"
              />
            </label>

            <label style={{ display: 'grid', gap: 6 }}>
              <div className="admin-label">Email</div>
              <input
                className="admin-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                type="email"
              />
            </label>

            <label style={{ display: 'grid', gap: 6 }}>
              <div className="admin-label">Password</div>
              <input
                className="admin-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                type="password"
              />
            </label>

            <label style={{ display: 'grid', gap: 6 }}>
              <div className="admin-label">Confirm password</div>
              <input
                className="admin-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                type="password"
              />
            </label>

            <label style={{ display: 'grid', gap: 6 }}>
              <div className="admin-label">First name (required)</div>
              <input
                className="admin-input"
                value={profileDraft.firstName ?? ''}
                onChange={(e) =>
                  setProfileDraft((prev) => ({ ...prev, firstName: e.target.value }))
                }
                placeholder="Given name"
                autoComplete="given-name"
                required
              />
            </label>

            <label style={{ display: 'grid', gap: 6 }}>
              <div className="admin-label">Last name (required)</div>
              <input
                className="admin-input"
                value={profileDraft.lastName ?? ''}
                onChange={(e) =>
                  setProfileDraft((prev) => ({ ...prev, lastName: e.target.value }))
                }
                placeholder="Family name"
                autoComplete="family-name"
                required
              />
            </label>
          </div>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginTop: 12,
              fontWeight: 800,
              fontSize: 13,
            }}
          >
            <input
              type="checkbox"
              checked={showProfile}
              onChange={(e) => setShowProfile(e.target.checked)}
            />
            Include additional employee profile fields (optional)
          </label>

          {showProfile ? (
            <div style={{ marginTop: 12 }}>
              <UserProfileFormFields
                variant="admin"
                value={profileDraft}
                onChange={setProfileDraft}
                omitFirstAndLastName
              />
            </div>
          ) : null}

          <div style={{ marginTop: 10, fontWeight: 900, color: 'rgba(15,23,42,0.58)', fontSize: 12 }}>
            New users start disabled until they confirm their email. With admin credentials, the API records
            an admin-provisioning consent when consents are omitted.
          </div>

          {email.trim().length > 0 && !emailLooksValid ? (
            <div style={{ marginTop: 8, fontWeight: 800, color: '#b45309', fontSize: 12 }}>
              Enter a valid email address (e.g. user@example.com).
            </div>
          ) : null}

          {error ? <div className="admin-modal-error">{error.message}</div> : null}
        </div>

        <div className="admin-modal-actions">
          <button type="button" className="app-button-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button
            type="button"
            className="app-button-primary"
            onClick={() => void onSubmit()}
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create user'}
          </button>
        </div>
      </div>
    </div>
  )
}
