import { useEffect, useState } from 'react'

import { createWarehouse, updateWarehouse } from '../../features/warehouses/api'
import type { Warehouse } from '../../features/warehouses/types'
import {
  draftFromWarehouse,
  emptyWarehouseDraft,
  isWarehouseStatus,
  payloadFromDraft,
  type WarehouseFormDraft,
} from '../../features/warehouses/warehousePayload'
import type { ApiError } from '../../services/apiClient'

import '../Admin/adminModals.css'

export function WarehouseFormModal({
  mode,
  initial,
  onClose,
  onSaved,
}: {
  mode: 'create' | 'edit'
  initial?: Warehouse | null
  onClose: () => void
  onSaved: (w: Warehouse) => void
}) {
  const [draft, setDraft] = useState<WarehouseFormDraft>(() =>
    mode === 'edit' && initial ? draftFromWarehouse(initial) : emptyWarehouseDraft(),
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  useEffect(() => {
    if (mode === 'edit' && initial) {
      setDraft(draftFromWarehouse(initial))
    } else {
      setDraft(emptyWarehouseDraft())
    }
  }, [mode, initial])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const title = mode === 'create' ? 'Create warehouse' : 'Edit warehouse'

  const onSubmit = async () => {
    try {
      setError(null)
      const payload = payloadFromDraft(draft)

      setIsSubmitting(true)
      let result: Warehouse
      if (mode === 'create') {
        result = await createWarehouse(payload)
      } else {
        if (!initial) {
          setError({ status: 400, message: 'Missing warehouse to update.' })
          return
        }
        result = await updateWarehouse(initial.id, payload)
      }
      onSaved(result)
      onClose()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError({ status: 400, message: err.message })
        return
      }
      setError(err as ApiError)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="admin-modal-overlay" role="dialog" aria-modal="true">
      <div className="admin-modal" style={{ maxWidth: 640 }}>
        <div className="admin-modal-header">
          <div className="admin-modal-title">{title}</div>
          <button type="button" className="admin-modal-close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="admin-modal-body">
          <div className="admin-modal-field-grid">
            <div>
              <div className="admin-label">Warehouse code (optional)</div>
              <input
                className="admin-input"
                value={draft.warehouseCode}
                onChange={(e) => setDraft((d) => ({ ...d, warehouseCode: e.target.value }))}
                autoComplete="off"
                placeholder="Leave empty to auto-generate (e.g. WH-00042)"
              />
            </div>
            <div>
              <div className="admin-label">Name *</div>
              <input
                className="admin-input"
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                autoComplete="off"
                placeholder="e.g. Austin Logistics Hub"
              />
            </div>
            <div>
              <div className="admin-label">Location *</div>
              <input
                className="admin-input"
                value={draft.location}
                onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
                autoComplete="off"
                placeholder="City, state / country"
              />
            </div>
            <div>
              <div className="admin-label">Region (optional)</div>
              <input
                className="admin-input"
                value={draft.region}
                onChange={(e) => setDraft((d) => ({ ...d, region: e.target.value }))}
                autoComplete="off"
                placeholder="e.g. US-South, EU-Central, APAC"
              />
            </div>
            <div>
              <div className="admin-label">Status *</div>
              <select
                className="admin-input"
                value={draft.status}
                onChange={(e) => {
                  const v = e.target.value
                  if (isWarehouseStatus(v)) {
                    setDraft((d) => ({ ...d, status: v }))
                  }
                }}
              >
                <option value="ACTIVE">Active</option>
                <option value="FULL">Full</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </div>
            <div>
              <div className="admin-label">Maximum capacity m² (optional)</div>
              <input
                className="admin-input"
                inputMode="numeric"
                value={draft.maxCapacityM2Input}
                onChange={(e) => setDraft((d) => ({ ...d, maxCapacityM2Input: e.target.value }))}
                autoComplete="off"
                placeholder="Total floor area in square meters"
              />
            </div>
            <div>
              <div className="admin-label">Occupied m² (optional)</div>
              <input
                className="admin-input"
                inputMode="numeric"
                value={draft.occupiedM2Input}
                onChange={(e) => setDraft((d) => ({ ...d, occupiedM2Input: e.target.value }))}
                autoComplete="off"
                placeholder="Currently used area"
              />
            </div>
            <div>
              <div className="admin-label">Contact number (optional)</div>
              <input
                className="admin-input"
                value={draft.contactNumber}
                onChange={(e) => setDraft((d) => ({ ...d, contactNumber: e.target.value }))}
                autoComplete="tel"
                placeholder="Phone or extension"
              />
            </div>
          </div>
          {error ? <div className="admin-modal-error">{error.message}</div> : null}
        </div>

        <div className="admin-modal-actions">
          <button
            type="button"
            className="ds-btn-ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="ds-btn-primary"
            onClick={() => void onSubmit()}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create warehouse' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
