import { useEffect, useState } from 'react'

import { createCustomer, getCustomer, updateCustomer } from '../../features/customers/api'
import type { CustomerDto, CustomerPayload } from '../../features/customers/types'
import { isAbortError, type ApiError } from '../../services/apiClient'

import '../Admin/adminModals.css'
import './customerModals.css'

function emptyPayload(): CustomerPayload {
  return {
    fullName: '',
    email: null,
    phone: null,
    address: null,
    taxNumber: null,
    companyName: null,
  }
}

function dtoToPayload(c: CustomerDto): CustomerPayload {
  return {
    fullName: c.fullName ?? '',
    email: c.email?.trim() ? c.email : null,
    phone: c.phone?.trim() ? c.phone : null,
    address: c.address?.trim() ? c.address : null,
    taxNumber: c.taxNumber?.trim() ? c.taxNumber : null,
    companyName: c.companyName?.trim() ? c.companyName : null,
  }
}

type Props = {
  mode: 'create' | 'edit'
  customerId?: number
  onClose: () => void
  onSaved: () => void
}

export function CustomerFormModal({ mode, customerId, onClose, onSaved }: Props) {
  const [draft, setDraft] = useState<CustomerPayload>(() => emptyPayload())
  const [loading, setLoading] = useState(mode === 'edit')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (mode !== 'edit' || customerId == null) {
      setDraft(emptyPayload())
      setLoading(false)
      return
    }
    const ac = new AbortController()
    setLoading(true)
    setError(null)
    getCustomer(customerId, ac.signal)
      .then((c) => {
        if (ac.signal.aborted) return
        setDraft(dtoToPayload(c))
      })
      .catch((e) => {
        if (isAbortError(e)) return
        setError((e as ApiError).message)
      })
      .finally(() => {
        if (!ac.signal.aborted) setLoading(false)
      })
    return () => ac.abort()
  }, [mode, customerId])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const submit = async () => {
    const fullName = draft.fullName.trim()
    if (!fullName) {
      setError('Full name is required.')
      return
    }
    const body: CustomerPayload = {
      fullName,
      email: draft.email?.trim() ? draft.email.trim() : null,
      phone: draft.phone?.trim() ? draft.phone.trim() : null,
      address: draft.address?.trim() ? draft.address.trim() : null,
      taxNumber: draft.taxNumber?.trim() ? draft.taxNumber.trim() : null,
      companyName: draft.companyName?.trim() ? draft.companyName.trim() : null,
    }
    setSaving(true)
    setError(null)
    try {
      if (mode === 'create') {
        await createCustomer(body)
      } else if (customerId != null) {
        await updateCustomer(customerId, body)
      }
      onSaved()
      onClose()
    } catch (e) {
      setError((e as ApiError).message)
    } finally {
      setSaving(false)
    }
  }

  const title = mode === 'create' ? 'New customer' : 'Edit customer'

  return (
    <div className="admin-modal-overlay" role="presentation" onMouseDown={onClose}>
      <div
        className="admin-modal"
        style={{ maxWidth: 560 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cu-form-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="admin-modal-header">
          <div>
            <div id="cu-form-title" className="admin-modal-title">
              {title}
            </div>
            {mode === 'edit' && customerId != null ? (
              <p style={{ margin: '6px 0 0', fontSize: 12, fontWeight: 800, color: 'var(--ds-muted)' }}>
                ID #{customerId}
              </p>
            ) : null}
          </div>
          <button type="button" className="admin-modal-close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="admin-modal-body">
          {loading ? (
            <p style={{ margin: 0, fontWeight: 700, color: 'var(--ds-muted)' }}>Loading…</p>
          ) : (
            <>
              {error ? (
                <p style={{ margin: '0 0 14px', color: '#dc2626', fontWeight: 800 }} role="alert">
                  {error}
                </p>
              ) : null}
              <div className="admin-modal-field-grid">
                <div className="cu-modal-field">
                  <label className="cu-modal-label" htmlFor="cu-fullName">
                    Full name *
                  </label>
                  <input
                    id="cu-fullName"
                    className="cu-modal-input"
                    value={draft.fullName}
                    onChange={(e) => setDraft((d) => ({ ...d, fullName: e.target.value }))}
                    autoComplete="name"
                  />
                </div>
                <div className="cu-modal-grid-2">
                  <div className="cu-modal-field">
                    <label className="cu-modal-label" htmlFor="cu-email">
                      Email
                    </label>
                    <input
                      id="cu-email"
                      type="email"
                      className="cu-modal-input"
                      value={draft.email ?? ''}
                      onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value || null }))}
                      autoComplete="email"
                    />
                  </div>
                  <div className="cu-modal-field">
                    <label className="cu-modal-label" htmlFor="cu-phone">
                      Phone
                    </label>
                    <input
                      id="cu-phone"
                      className="cu-modal-input"
                      value={draft.phone ?? ''}
                      onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value || null }))}
                      autoComplete="tel"
                    />
                  </div>
                </div>
                <div className="cu-modal-field">
                  <label className="cu-modal-label" htmlFor="cu-company">
                    Company
                  </label>
                  <input
                    id="cu-company"
                    className="cu-modal-input"
                    value={draft.companyName ?? ''}
                    onChange={(e) => setDraft((d) => ({ ...d, companyName: e.target.value || null }))}
                  />
                </div>
                <div className="cu-modal-field">
                  <label className="cu-modal-label" htmlFor="cu-tax">
                    Tax number
                  </label>
                  <input
                    id="cu-tax"
                    className="cu-modal-input"
                    value={draft.taxNumber ?? ''}
                    onChange={(e) => setDraft((d) => ({ ...d, taxNumber: e.target.value || null }))}
                  />
                </div>
                <div className="cu-modal-field">
                  <label className="cu-modal-label" htmlFor="cu-address">
                    Address
                  </label>
                  <textarea
                    id="cu-address"
                    className="cu-modal-textarea"
                    value={draft.address ?? ''}
                    onChange={(e) => setDraft((d) => ({ ...d, address: e.target.value || null }))}
                  />
                </div>
              </div>
            </>
          )}
        </div>
        <div className="admin-modal-actions">
          <button type="button" className="ds-btn-ghost" onClick={onClose} disabled={saving || loading}>
            Cancel
          </button>
          <button type="button" className="ds-btn-primary" onClick={() => void submit()} disabled={saving || loading}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
