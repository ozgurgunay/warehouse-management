import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { confirmRegistration } from '../../features/users/api'
import type { ApiError } from '../../services/apiClient'

export function ConfirmEmailPage() {
  const [searchParams] = useSearchParams()
  const token = useMemo(() => searchParams.get('token')?.trim() ?? '', [searchParams])

  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)

  const onConfirm = async () => {
    if (!token) return
    setStatus('loading')
    setMessage(null)
    try {
      const text = await confirmRegistration(token)
      setStatus('done')
      setMessage(text || 'Your email is confirmed. You can sign in now.')
    } catch (err) {
      setStatus('error')
      setMessage((err as ApiError).message || 'Confirmation failed.')
    }
  }

  if (!token) {
    return (
      <div className="auth-form">
        <div className="auth-form-heading">
          <h2 className="auth-form-title">Confirm email</h2>
          <p className="auth-form-subtitle">This link is missing a token. Use the link from your registration email.</p>
        </div>
        <Link to="/login" className="auth-secondary-link">
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="auth-form">
      <div className="auth-form-heading">
        <h2 className="auth-form-title">Confirm email</h2>
        <p className="auth-form-subtitle">
          Click the button below to activate your account. We ask for this extra step so automated email scanners cannot
          enable your account without you.
        </p>
      </div>

      {status === 'idle' || status === 'loading' ? (
        <button
          type="button"
          className="auth-primary-button"
          style={{ marginTop: 16, width: '100%' }}
          disabled={status === 'loading'}
          onClick={() => void onConfirm()}
        >
          {status === 'loading' ? 'Confirming…' : 'Confirm registration'}
        </button>
      ) : null}

      {message ? (
        <p className={status === 'error' ? 'auth-error' : 'auth-success'} style={{ marginTop: 16 }}>
          {message}
        </p>
      ) : null}

      {status === 'done' ? (
        <Link to="/login" className="auth-primary-button" style={{ marginTop: 16, display: 'block', textAlign: 'center' }}>
          Go to sign in
        </Link>
      ) : null}

      <div className="auth-links-row" style={{ marginTop: 20 }}>
        <Link to="/login" className="auth-link-muted">
          Back to sign in
        </Link>
      </div>
    </div>
  )
}
