import { useEffect, useState } from 'react'

import { UserProfileFormFields } from '../../components/user/UserProfileFormFields'
import { getUserById, updateUserProfile } from '../../features/admin/api'
import type { UserProfilePayload } from '../../features/users/types'
import { emptyProfilePayload, profileFromApi, profilePayloadForPut } from '../../features/users/profilePayload'
import type { ApiError } from '../../services/apiClient'

import './adminModals.css'

export function AdminEditUserProfileModal({
  userId,
  username,
  onClose,
  onSaved,
}: {
  userId: number
  username: string
  onClose: () => void
  onSaved: () => void
}) {
  const [profileDraft, setProfileDraft] = useState<UserProfilePayload>(emptyProfilePayload())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    getUserById(userId, controller.signal)
      .then((u) => setProfileDraft(profileFromApi(u.profile)))
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setError(err as ApiError)
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [userId])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const onSave = async () => {
    try {
      setSaving(true)
      setError(null)
      await updateUserProfile(userId, profilePayloadForPut(profileDraft))
      onSaved()
      onClose()
    } catch (err) {
      setError(err as ApiError)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-modal-overlay" role="dialog" aria-modal="true">
      <div className="admin-modal" style={{ maxWidth: 720, maxHeight: '90vh', overflow: 'auto' }}>
        <div className="admin-modal-header">
          <div className="admin-modal-title">Edit profile — {username}</div>
          <button type="button" className="admin-modal-close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="admin-modal-body">
          {loading ? (
            <div className="app-muted" style={{ fontWeight: 800 }}>
              Loading profile…
            </div>
          ) : (
            <UserProfileFormFields
              variant="admin"
              value={profileDraft}
              onChange={setProfileDraft}
              requireFirstAndLast
            />
          )}
          {error ? <div className="admin-modal-error">{error.message}</div> : null}
        </div>

        <div className="admin-modal-actions">
          <button type="button" className="app-button-secondary" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button
            type="button"
            className="app-button-primary"
            onClick={() => void onSave()}
            disabled={loading || saving}
          >
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </div>
      </div>
    </div>
  )
}
