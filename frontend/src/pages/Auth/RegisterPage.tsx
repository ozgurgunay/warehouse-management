import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { LEGAL_DOC_VERSIONS } from '../../features/users/legalVersions'
import {
  emptyProfilePayload,
  profilePayloadForUserCreate,
  sanitizeProfileForApi,
} from '../../features/users/profilePayload'
import type { RegistrationPayload, UserProfilePayload } from '../../features/users/types'
import { registerUser } from '../../features/users/api'
import type { ApiError } from '../../services/apiClient'
import { UserProfileFormFields } from '../../components/user/UserProfileFormFields'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function RegisterPage() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showProfile, setShowProfile] = useState(false)
  const [profileDraft, setProfileDraft] = useState<UserProfilePayload>(() => emptyProfilePayload())
  const [acceptedPrivacyTerms, setAcceptedPrivacyTerms] = useState(false)
  const [acceptedEmployeeData, setAcceptedEmployeeData] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorText, setErrorText] = useState<string | null>(null)
  const [successText, setSuccessText] = useState<string | null>(null)

  const emailLooksValid = useMemo(() => EMAIL_PATTERN.test(email.trim()), [email])

  const firstLastFilled = useMemo(() => {
    const f = profileDraft.firstName?.trim() ?? ''
    const l = profileDraft.lastName?.trim() ?? ''
    return f.length > 0 && l.length > 0
  }, [profileDraft.firstName, profileDraft.lastName])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorText(null)
    setSuccessText(null)

    if (password !== confirmPassword) {
      setErrorText('Passwords do not match.')
      setIsSubmitting(false)
      return
    }

    if (!firstLastFilled) {
      setErrorText('First name and last name are required.')
      setIsSubmitting(false)
      return
    }

    if (!acceptedPrivacyTerms) {
      setErrorText('You must accept the Privacy Policy and Terms of Use.')
      setIsSubmitting(false)
      return
    }

    if (!acceptedEmployeeData) {
      setErrorText(
        'First and last name are stored as personal data. Please accept employee personal data processing.',
      )
      setIsSubmitting(false)
      return
    }

    if (!emailLooksValid) {
      setErrorText('Enter a valid email address.')
      setIsSubmitting(false)
      return
    }

    const consents: RegistrationPayload['consents'] = [
      {
        consentType: 'PRIVACY_NOTICE',
        documentVersion: LEGAL_DOC_VERSIONS.privacyNotice,
        accepted: true,
      },
      {
        consentType: 'TERMS_OF_USE',
        documentVersion: LEGAL_DOC_VERSIONS.termsOfUse,
        accepted: true,
      },
      {
        consentType: 'EMPLOYEE_PERSONAL_DATA',
        documentVersion: LEGAL_DOC_VERSIONS.employeePersonalData,
        accepted: true,
      },
    ]

    const profileForCreate = profilePayloadForUserCreate(profileDraft, showProfile)
    const profilePayload = sanitizeProfileForApi(profileForCreate)
    if (!profilePayload) {
      setErrorText('First name and last name are required.')
      setIsSubmitting(false)
      return
    }

    const body: RegistrationPayload = {
      username: username.trim(),
      email: email.trim(),
      password,
      consents,
      profile: profilePayload,
    }

    try {
      await registerUser(body)
      const successMessage =
        'Kayıt başarılı. Lütfen e-posta adresinizi kontrol edip hesabınızı onaylayın; ardından giriş yapabilirsiniz.'
      setSuccessText(successMessage)
      setTimeout(
        () =>
          navigate('/login', {
            state: { registrationSuccess: successMessage },
          }),
        2200,
      )
    } catch (err: unknown) {
      const apiError = err as ApiError
      setErrorText(apiError.message || 'Kayıt başarısız oldu.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-form">
      <div className="auth-form-heading">
        <h2 className="auth-form-title">Create account</h2>
        <p className="auth-form-subtitle">
          First and last name are required. Additional employee fields are optional. Data is sent to{' '}
          <code>POST /users/register</code> with KVKK-related consent records.
        </p>
      </div>

      <form onSubmit={onSubmit} style={{ marginTop: 4 }}>
        <div className="auth-field">
          <label className="auth-label" htmlFor="register-username">
            Username
          </label>
          <input
            id="register-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
            className="auth-input"
          />
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="register-email">
            Email
          </label>
          <input
            id="register-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            type="email"
            required
            className="auth-input"
          />
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="register-password">
            Password
          </label>
          <input
            id="register-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            type="password"
            required
            minLength={1}
            className="auth-input"
          />
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="register-confirm-password">
            Confirm password
          </label>
          <input
            id="register-confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            type="password"
            required
            minLength={1}
            className="auth-input"
          />
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="register-first-name">
            First name
          </label>
          <input
            id="register-first-name"
            value={profileDraft.firstName ?? ''}
            onChange={(e) =>
              setProfileDraft((prev) => ({ ...prev, firstName: e.target.value }))
            }
            autoComplete="given-name"
            required
            className="auth-input"
          />
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="register-last-name">
            Last name
          </label>
          <input
            id="register-last-name"
            value={profileDraft.lastName ?? ''}
            onChange={(e) =>
              setProfileDraft((prev) => ({ ...prev, lastName: e.target.value }))
            }
            autoComplete="family-name"
            required
            className="auth-input"
          />
        </div>

        <label className="auth-checkbox-row">
          <input
            className="auth-checkbox"
            type="checkbox"
            checked={showProfile}
            onChange={(e) => setShowProfile(e.target.checked)}
          />
          <span className="auth-checkbox-text">
            Add additional employee profile fields (optional)
          </span>
        </label>

        {showProfile ? (
          <div
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 12,
              border: '1px solid rgba(15,23,42,0.12)',
              maxHeight: 360,
              overflow: 'auto',
            }}
          >
            <UserProfileFormFields
              variant="account"
              value={profileDraft}
              onChange={setProfileDraft}
              omitFirstAndLastName
            />
          </div>
        ) : null}

        <label className="auth-checkbox-row" style={{ marginTop: 14 }}>
          <input
            className="auth-checkbox"
            type="checkbox"
            checked={acceptedPrivacyTerms}
            onChange={(e) => setAcceptedPrivacyTerms(e.target.checked)}
          />
          <span className="auth-checkbox-text">
            I accept the Privacy Notice and Terms of Use (required).
          </span>
        </label>

        <label className="auth-checkbox-row">
          <input
            className="auth-checkbox"
            type="checkbox"
            checked={acceptedEmployeeData}
            onChange={(e) => setAcceptedEmployeeData(e.target.checked)}
          />
          <span className="auth-checkbox-text">
            I consent to processing of my name and employee / personal data as described in the privacy
            notice (required).
          </span>
        </label>

        {errorText ? <p className="auth-error">{errorText}</p> : null}
        {successText ? <p className="auth-success">{successText}</p> : null}

        <div className="auth-actions">
          <button type="submit" className="auth-primary-button" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create account'}
          </button>
          <Link to="/login" className="auth-secondary-link">
            Back to sign in
          </Link>
        </div>

        <div className="auth-links-row">
          <Link to="/" className="auth-link-muted">
            Back to homepage
          </Link>
        </div>
      </form>
    </div>
  )
}
