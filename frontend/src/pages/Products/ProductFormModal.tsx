import { useEffect, useState } from 'react'

import { useAuth } from '../../auth/AuthContext'
import { getCategories } from '../../features/categories/api'
import type { Category } from '../../features/categories/types'
import { createProduct, getProductById, updateProduct } from '../../features/products/api'
import type { ProductDto } from '../../features/products/types'
import type { ApiError } from '../../services/apiClient'

import '../Admin/adminModals.css'

function emptyDraft(username: string): ProductDto {
  return {
    name: '',
    sku: '',
    price: null,
    description: null,
    categoryId: null,
    manufacturer: null,
    dimensionsText: null,
    weightKg: null,
    material: null,
    operatingTempRange: null,
    ipRating: null,
    imageUrl: null,
    lowStockThreshold: null,
    createdBy: username,
    updatedBy: username,
  }
}

export function ProductFormModal({
  mode,
  productId,
  onClose,
  onSaved,
}: {
  mode: 'create' | 'edit'
  productId?: number
  onClose: () => void
  onSaved: () => void
}) {
  const { currentUser } = useAuth()
  const username = currentUser?.username ?? 'system'

  const [categories, setCategories] = useState<Category[]>([])
  const [draft, setDraft] = useState<ProductDto>(() => emptyDraft(username))
  const [loading, setLoading] = useState(mode === 'edit')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  useEffect(() => {
    const c = new AbortController()
    getCategories(c.signal)
      .then(setCategories)
      .catch(() => setCategories([]))
    return () => c.abort()
  }, [])

  useEffect(() => {
    if (mode !== 'edit' || !productId) {
      setDraft(emptyDraft(username))
      setLoading(false)
      return
    }
    const c = new AbortController()
    setLoading(true)
    setError(null)
    getProductById(productId, c.signal)
      .then((p) => {
        setDraft({
          ...p,
          updatedBy: username,
        })
      })
      .catch((e: unknown) => setError(e as ApiError))
      .finally(() => setLoading(false))
    return () => c.abort()
  }, [mode, productId, username])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const onSubmit = async () => {
    try {
      setError(null)
      const name = draft.name.trim()
      const sku = draft.sku.trim()
      if (!name || !sku) {
        setError({ status: 400, message: 'Name and SKU are required.' })
        return
      }
      if (draft.price == null || draft.price <= 0) {
        setError({ status: 400, message: 'Price must be a positive number.' })
        return
      }
      const body: ProductDto = {
        ...draft,
        name,
        sku,
        createdBy: mode === 'create' ? username : draft.createdBy,
        updatedBy: username,
      }
      setSaving(true)
      if (mode === 'create') {
        await createProduct(body)
      } else if (productId) {
        await updateProduct(productId, body)
      }
      onSaved()
      onClose()
    } catch (e: unknown) {
      setError(e as ApiError)
    } finally {
      setSaving(false)
    }
  }

  const title = mode === 'create' ? 'Create product' : 'Edit product'

  return (
    <div className="admin-modal-overlay" role="dialog" aria-modal="true">
      <div className="admin-modal" style={{ maxWidth: 720 }}>
        <div className="admin-modal-header">
          <div className="admin-modal-title">{title}</div>
          <button type="button" className="admin-modal-close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="admin-modal-body">
          {loading ? (
            <p>Loading…</p>
          ) : (
            <div className="admin-modal-field-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <div className="admin-label">Name *</div>
                <input
                  className="admin-input"
                  value={draft.name}
                  onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                />
              </div>
              <div>
                <div className="admin-label">SKU *</div>
                <input
                  className="admin-input"
                  value={draft.sku}
                  onChange={(e) => setDraft((d) => ({ ...d, sku: e.target.value }))}
                  disabled={mode === 'edit'}
                  title={mode === 'edit' ? 'SKU is fixed after create' : ''}
                />
              </div>
              <div>
                <div className="admin-label">Price (USD) *</div>
                <input
                  className="admin-input"
                  type="number"
                  min={0.01}
                  step={0.01}
                  value={draft.price ?? ''}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      price: e.target.value === '' ? null : Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <div className="admin-label">Category</div>
                <select
                  className="admin-input"
                  value={draft.categoryId ?? ''}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      categoryId: e.target.value === '' ? null : Number(e.target.value),
                    }))
                  }
                >
                  <option value="">— None —</option>
                  {categories
                    .filter((c) => (c.status ?? 'ACTIVE') === 'ACTIVE')
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <div className="admin-label">Description</div>
                <textarea
                  className="admin-input"
                  rows={3}
                  value={draft.description ?? ''}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, description: e.target.value.trim() ? e.target.value : null }))
                  }
                />
              </div>
              <div>
                <div className="admin-label">Manufacturer</div>
                <input
                  className="admin-input"
                  value={draft.manufacturer ?? ''}
                  onChange={(e) => setDraft((d) => ({ ...d, manufacturer: e.target.value || null }))}
                />
              </div>
              <div>
                <div className="admin-label">Dimensions</div>
                <input
                  className="admin-input"
                  placeholder='e.g. 120 x 85 x 85 mm'
                  value={draft.dimensionsText ?? ''}
                  onChange={(e) => setDraft((d) => ({ ...d, dimensionsText: e.target.value || null }))}
                />
              </div>
              <div>
                <div className="admin-label">Weight (kg)</div>
                <input
                  className="admin-input"
                  type="number"
                  min={0}
                  step={0.001}
                  value={draft.weightKg ?? ''}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      weightKg: e.target.value === '' ? null : Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div>
                <div className="admin-label">Material</div>
                <input
                  className="admin-input"
                  value={draft.material ?? ''}
                  onChange={(e) => setDraft((d) => ({ ...d, material: e.target.value || null }))}
                />
              </div>
              <div>
                <div className="admin-label">Operating temp</div>
                <input
                  className="admin-input"
                  value={draft.operatingTempRange ?? ''}
                  onChange={(e) => setDraft((d) => ({ ...d, operatingTempRange: e.target.value || null }))}
                />
              </div>
              <div>
                <div className="admin-label">IP rating</div>
                <input
                  className="admin-input"
                  value={draft.ipRating ?? ''}
                  onChange={(e) => setDraft((d) => ({ ...d, ipRating: e.target.value || null }))}
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <div className="admin-label">Image URL</div>
                <input
                  className="admin-input"
                  value={draft.imageUrl ?? ''}
                  onChange={(e) => setDraft((d) => ({ ...d, imageUrl: e.target.value || null }))}
                />
              </div>
              <div>
                <div className="admin-label">Low stock threshold</div>
                <input
                  className="admin-input"
                  type="number"
                  min={1}
                  step={1}
                  value={draft.lowStockThreshold ?? ''}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      lowStockThreshold: e.target.value === '' ? null : Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>
          )}
          {error ? <div className="admin-modal-error">{error.message}</div> : null}
        </div>

        <div className="admin-modal-actions">
          <button type="button" className="ds-btn-ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="button" className="ds-btn-primary" onClick={() => void onSubmit()} disabled={saving || loading}>
            {saving ? 'Saving…' : mode === 'create' ? 'Create' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
