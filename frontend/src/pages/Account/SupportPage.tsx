import { useState, type FormEvent } from 'react'

import { AccountLayout } from './AccountLayout'

export function SupportPage() {
  const [message, setMessage] = useState('')
  const [responseMessage, setResponseMessage] = useState<string | null>(null)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    setResponseMessage('Message saved locally. Backend support ticket API will be added later.')
    setMessage('')
  }

  return (
    <AccountLayout active="support">
      <div className="account-page-section-title">Support</div>

      <div className="account-card">
        <div className="account-card-header">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 14, fontWeight: 900 }}>Contact support</div>
            <div style={{ fontSize: 12, fontWeight: 900, color: 'rgba(15, 23, 42, 0.6)' }}>
              Send a message. This is UI-only for now.
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit}>
          <div className="account-form-grid" style={{ gridTemplateColumns: '1fr', marginTop: 18 }}>
            <div className="account-form-field">
              <div className="account-form-label">Message</div>
              <textarea
                className="account-input"
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
          </div>

          <div className="account-form-actions">
            <button type="button" className="account-action-button" onClick={() => setMessage('')}>
              Clear
            </button>
            <button type="submit" className="account-action-button account-action-button--primary">
              Send
            </button>
          </div>

          {responseMessage ? <div className="account-hint">{responseMessage}</div> : null}
        </form>
      </div>

      <div className="account-card">
        <div className="account-card-header">
          <div style={{ fontSize: 14, fontWeight: 900 }}>Help center</div>
        </div>

        <div className="account-location-row">
          <div className="account-muted-value">
            1) Update your profile in <b>My Profile</b>.
          </div>
          <div className="account-muted-value">
            2) Manage preferences in <b>Settings</b>.
          </div>
          <div className="account-muted-value">
            3) Contact support using the form above.
          </div>
        </div>
      </div>
    </AccountLayout>
  )
}

