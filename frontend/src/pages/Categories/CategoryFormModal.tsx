import { useEffect, useState } from 'react'

import {
  createCategory,
  getCategoryById,
  updateCategory,
} from '../../features/categories/api'
import { formatCategoryCode } from '../../features/categories/format'
import type { CategoryPayload, CategoryStatus } from '../../features/categories/types'
import { isAbortError, type ApiError } from '../../services/apiClient'

import '../Admin/adminModals.css'
import './categoryModals.css'

const MAX_DESCRIPTION = 500

type Props = {
  mode: 'create' | 'edit'
  categoryId?: number
  onClose: () => void
  onSaved: () => void
}

export function CategoryFormModal({ mode, categoryId, onClose, onSaved }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<CategoryStatus>('ACTIVE')
  const [productCount, setProductCount] = useState<number | null>(null)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(mode === 'edit')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (mode !== 'edit' || categoryId == null) return
    const ac = new AbortController()
    setLoading(true)
    setError(null)
    getCategoryById(categoryId, ac.signal)
      .then((c) => {
        if (ac.signal.aborted) return
        setName(c.name)
        setDescription(c.description ?? '')
        setStatus(c.status ?? 'ACTIVE')
        setProductCount(c.productCount ?? 0)
        setUpdatedAt(c.updatedAt ?? null)
      })
      .catch((e) => {
        if (isAbortError(e)) return
        setError((e as ApiError).message)
      })
      .finally(() => {
        if (!ac.signal.aborted) setLoading(false)
      })
    return () => ac.abort()
  }, [mode, categoryId])

  const activeToggle = status === 'ACTIVE'

  const submit = async () => {
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Name is required.')
      return
    }
    const descTrimmed = description.trim()
    if (descTrimmed.length > MAX_DESCRIPTION) {
      setError(`Description must be at most ${MAX_DESCRIPTION} characters.`)
      return
    }
    const body: CategoryPayload = {
      name: trimmed,
      description: descTrimmed ? descTrimmed : null,
      status,
    }
    setSaving(true)
    setError(null)
    try {
      if (mode === 'create') {
        await createCategory(body)
      } else if (categoryId != null) {
        await updateCategory(categoryId, body)
      }
      onSaved()
      onClose()
    } catch (e) {
      setError((e as ApiError).message)
    } finally {
      setSaving(false)
    }
  }

  const formattedUpdated =
    updatedAt != null
      ? new Date(updatedAt).toLocaleString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '—'

  return (
    <div className="admin-modal-overlay" role="presentation" onMouseDown={onClose}>
      <div
        className="cat-modal-shell"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cat-form-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="cat-modal-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <h2 id="cat-form-title" className="cat-modal-title">
              {mode === 'create' ? 'Add category' : 'Edit category'}
            </h2>
            {mode === 'edit' && categoryId != null ? (
              <p className="cat-modal-title-sub">Category ID: {formatCategoryCode(categoryId)}</p>
            ) : null}
          </div>
          <button type="button" className="admin-modal-close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="cat-modal-body-scroll">
          {loading ? (
            <p style={{ margin: 0, fontWeight: 700 }}>Loading…</p>
          ) : (
            <>
              {error ? (
                <div
                  style={{
                    marginBottom: 14,
                    padding: '10px 12px',
                    borderRadius: 12,
                    background: 'rgba(220,38,38,0.08)',
                    color: '#b91c1c',
                    fontWeight: 800,
                    fontSize: 13,
                  }}
                >
                  {error}
                </div>
              ) : null}

              <div style={{ marginBottom: 16 }}>
                <label className="cat-modal-label" htmlFor="cat-form-name">
                  Category name
                </label>
                <input
                  id="cat-form-name"
                  className="cat-modal-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus={mode === 'create'}
                  maxLength={255}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className="cat-modal-label" htmlFor="cat-form-desc">
                  Description
                </label>
                <div className="cat-modal-textarea-wrap">
                  <textarea
                    id="cat-form-desc"
                    className="cat-modal-input cat-modal-textarea"
                    value={description}
                    onChange={(e) => setDescription(e.target.value.slice(0, MAX_DESCRIPTION))}
                    maxLength={MAX_DESCRIPTION}
                  />
                  <span className="cat-modal-char-count">
                    {description.length} / {MAX_DESCRIPTION} characters
                  </span>
                </div>
              </div>

              <div>
                <div className="cat-modal-status-bar">
                  <div className="cat-modal-status-text">
                    <span className="cat-modal-status-title">Category status</span>
                    <span className="cat-modal-status-hint">Currently visible in inventory</span>
                  </div>
                  <div className={`cat-modal-toggle ${activeToggle ? 'cat-modal-toggle--active' : ''}`}>
                    <button
                      type="button"
                      className="cat-modal-switch"
                      role="switch"
                      aria-checked={activeToggle}
                      onClick={() => setStatus((s) => (s === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE'))}
                    >
                      <span className="cat-modal-switch-thumb" aria-hidden />
                    </button>
                    <span className="cat-modal-toggle-label">{activeToggle ? 'ACTIVE' : 'ARCHIVED'}</span>
                  </div>
                </div>
              </div>

              <div className="cat-modal-info-grid">
                <div className="cat-modal-info-card cat-modal-info-card--blue">
                  <div className="cat-modal-info-label">Associated SKUs</div>
                  <div className="cat-modal-info-value">
                    {mode === 'edit' ? (productCount ?? 0).toLocaleString('en-US') : '0'}
                  </div>
                </div>
                <div className="cat-modal-info-card cat-modal-info-card--tan">
                  <div className="cat-modal-info-label">Last updated</div>
                  <div className="cat-modal-info-value-sm">{mode === 'edit' ? formattedUpdated : '—'}</div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="cat-modal-footer">
          <button type="button" className="cat-modal-btn-link" onClick={onClose} disabled={saving || loading}>
            Cancel
          </button>
          <div className="cat-modal-footer-actions">
            <button
              type="button"
              className="ds-btn-primary"
              onClick={() => void submit()}
              disabled={saving || loading}
            >
              {saving ? 'Saving…' : mode === 'create' ? 'Create category' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
