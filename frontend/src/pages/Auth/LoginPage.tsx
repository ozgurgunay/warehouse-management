import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../../auth/AuthContext'

type LocationState = {
  from?: string
  registrationSuccess?: string
}

export function LoginPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = useMemo(() => {
    const state = location.state as LocationState | null
    return state?.from ?? '/app'
  }, [location.state])

  const registrationSuccessHint = useMemo(() => {
    const state = location.state as LocationState | null
    return state?.registrationSuccess ?? null
  }, [location.state])

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorText, setErrorText] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorText(null)

    try {
      await auth.login({ username, password }, { rememberMe })
      navigate(from, { replace: true })
    } catch (err) {
      setErrorText('Login failed. Please check your credentials.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-form">
      <div className="auth-form-heading">
        <h2 className="auth-form-title">Log in</h2>
        <p className="auth-form-subtitle">
          Use your backend credentials (HTTP Basic Auth). Default admin user:
          <strong> admin</strong> / <strong>admin123</strong>
        </p>
      </div>

      <form onSubmit={onSubmit} style={{ marginTop: 4 }}>
        {registrationSuccessHint ? (
          <p className="auth-success" style={{ marginBottom: 12 }}>
            {registrationSuccessHint}
          </p>
        ) : null}
        <div className="auth-field">
          <label className="auth-label" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
            className="auth-input"
          />
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="password">
            Password
          </label>
          <div className="auth-password-input-wrapper">
            <input
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              type={showPassword ? 'text' : 'password'}
              required
              className="auth-input auth-password-input"
            />
            {/* Keep toggle aligned with the input, but outside the input itself */}
            <button
              type="button"
              className="auth-password-toggle-button"
              aria-pressed={showPassword}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((x) => !x)}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M2.1 12.1C3.8 7.9 7.6 5 12 5C16.4 5 20.2 7.9 21.9 12.1C22.0 12.4 22.0 12.6 21.9 12.9C20.2 17.1 16.4 20 12 20C7.6 20 3.8 17.1 2.1 12.9C2.0 12.6 2.0 12.4 2.1 12.1Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                {showPassword ? null : (
                  <path
                    d="M4 20L20 4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                )}
              </svg>
              <span className="auth-password-toggle-text">
                {showPassword ? 'Hide' : 'Show'}
              </span>
            </button>
          </div>
        </div>

        <label className="auth-checkbox-row">
          <input
            className="auth-checkbox"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <span className="auth-checkbox-text">Remember password</span>
        </label>

        {errorText ? <p className="auth-error">{errorText}</p> : null}

        <div className="auth-actions">
          <button
            type="submit"
            className="auth-primary-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Log in'}
          </button>
          <Link to="/register" className="auth-secondary-link">
            Create an account
          </Link>
        </div>

        <div className="auth-links-row">
          <Link to="/" className="auth-link-muted">
            Back to homepage
          </Link>
          <a className="auth-link-muted" href="#">
            Forgot password?
          </a>
        </div>
      </form>
    </div>
  )
}

