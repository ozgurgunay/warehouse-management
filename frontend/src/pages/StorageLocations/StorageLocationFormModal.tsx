import { useEffect, useState } from 'react'

import {
  createStorageLocation,
  updateStorageLocation,
} from '../../features/storage-locations/api'
import {
  draftFromLocation,
  emptyLocationDraft,
  payloadFromDraft,
  type StorageLocationFormDraft,
} from '../../features/storage-locations/locationPayload'
import type { StorageLocation } from '../../features/storage-locations/types'
import { useWarehouses } from '../../features/warehouses/hooks/useWarehouses'
import { warehouseLabel } from '../../features/warehouses/format'
import type { ApiError } from '../../services/apiClient'

import '../Admin/adminModals.css'

export function StorageLocationFormModal({
  mode,
  initial,
  defaultWarehouseId,
  onClose,
  onSaved,
}: {
  mode: 'create' | 'edit'
  initial?: StorageLocation | null
  /** Pre-select warehouse when opening create from a filtered list. */
  defaultWarehouseId?: number | null
  onClose: () => void
  onSaved: (row: StorageLocation) => void
}) {
  const { data: warehouses } = useWarehouses()
  const [draft, setDraft] = useState<StorageLocationFormDraft>(() => {
    if (mode === 'edit' && initial) return draftFromLocation(initial)
    const d = emptyLocationDraft()
    if (defaultWarehouseId != null) d.warehouseId = defaultWarehouseId
    return d
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  useEffect(() => {
    if (mode === 'edit' && initial) {
      setDraft(draftFromLocation(initial))
    } else {
      const d = emptyLocationDraft()
      if (defaultWarehouseId != null) d.warehouseId = defaultWarehouseId
      setDraft(d)
    }
  }, [mode, initial, defaultWarehouseId])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const title = mode === 'create' ? 'New storage location' : 'Edit storage location'

  const onSubmit = async () => {
    try {
      setError(null)
      const payload = payloadFromDraft(draft)
      setIsSubmitting(true)
      let result: StorageLocation
      if (mode === 'create') {
        result = await createStorageLocation(payload)
      } else {
        if (!initial) {
          setError({ status: 400, message: 'Missing location to update.' })
          return
        }
        result = await updateStorageLocation(initial.id, payload)
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

  const warehouseOptions = warehouses ?? []

  return (
    <div className="admin-modal-overlay" role="dialog" aria-modal="true">
      <div className="admin-modal" style={{ maxWidth: 560 }}>
        <div className="admin-modal-header">
          <div className="admin-modal-title">{title}</div>
          <button type="button" className="admin-modal-close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="admin-modal-body">
          <div className="admin-modal-field-grid">
            {mode === 'create' ? (
              <div>
                <div className="admin-label">Warehouse *</div>
                <select
                  className="admin-input"
                  aria-label="Warehouse"
                  value={draft.warehouseId ?? ''}
                  onChange={(e) => {
                    const v = e.target.value
                    setDraft((d) => ({
                      ...d,
                      warehouseId: v === '' ? null : Number(v),
                    }))
                  }}
                >
                  <option value="">Select warehouse…</option>
                  {warehouseOptions.map((w) => (
                    <option key={w.id} value={w.id}>
                      {warehouseLabel(w)}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <div className="admin-label">Warehouse</div>
                <input
                  className="admin-input"
                  readOnly
                  value={
                    initial
                      ? `${initial.warehouseName ?? '—'} (ID ${initial.warehouseId})`
                      : ''
                  }
                />
              </div>
            )}
            <div>
              <div className="admin-label">Location ID (optional)</div>
              <input
                className="admin-input"
                value={draft.locationCode}
                onChange={(e) => setDraft((d) => ({ ...d, locationCode: e.target.value }))}
                autoComplete="off"
                placeholder="Auto-generated if empty (e.g. L-00042)"
              />
            </div>
            <div>
              <div className="admin-label">Name *</div>
              <input
                className="admin-input"
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                autoComplete="off"
                placeholder="e.g. Shelf A-1"
              />
            </div>
            <div>
              <div className="admin-label">Building</div>
              <input
                className="admin-input"
                value={draft.building}
                onChange={(e) => setDraft((d) => ({ ...d, building: e.target.value }))}
                autoComplete="off"
                placeholder="e.g. Building A"
              />
            </div>
            <div>
              <div className="admin-label">Floor</div>
              <input
                className="admin-input"
                value={draft.floor}
                onChange={(e) => setDraft((d) => ({ ...d, floor: e.target.value }))}
                autoComplete="off"
                placeholder="e.g. Floor 01"
              />
            </div>
            <div>
              <div className="admin-label">Section</div>
              <input
                className="admin-input"
                value={draft.section}
                onChange={(e) => setDraft((d) => ({ ...d, section: e.target.value }))}
                autoComplete="off"
                placeholder="e.g. Section 04"
              />
            </div>
            <div>
              <div className="admin-label">Zone label (optional)</div>
              <input
                className="admin-input"
                value={draft.zoneLabel}
                onChange={(e) => setDraft((d) => ({ ...d, zoneLabel: e.target.value }))}
                autoComplete="off"
                placeholder="e.g. Zone A (hot / fast-moving)"
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
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
