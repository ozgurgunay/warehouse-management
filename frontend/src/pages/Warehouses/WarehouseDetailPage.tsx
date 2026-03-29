import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { useAuth } from '../../auth/AuthContext'
import {
  displayWarehouseCode,
  formatM2,
  formatPercent,
  formatWarehouseContact,
  occupancyPercent,
  warehouseStatusLabel,
} from '../../features/warehouses/format'
import { useWarehouse } from '../../features/warehouses/hooks/useWarehouse'
import { WarehouseDeleteModal } from './WarehouseDeleteModal'
import { WarehouseFormModal } from './WarehouseFormModal'

function statusBadgeClass(status: string): string {
  if (status === 'ACTIVE') return 'ds-badge ds-badge--success'
  if (status === 'FULL') return 'ds-badge ds-badge--danger'
  return 'ds-badge ds-badge--warning'
}

export function WarehouseDetailPage() {
  const { warehouseId } = useParams()
  const navigate = useNavigate()
  const { hasCapability } = useAuth()
  const canWrite = hasCapability('warehouses.write')

  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const parsedId = Number(warehouseId)
  const isValidId = Number.isFinite(parsedId)

  const { data, isLoading, error, refetch } = useWarehouse(
    isValidId ? parsedId : null,
    isValidId,
  )

  const occ = data ? occupancyPercent(data) : null

  return (
    <div className="ds-page">
      <nav className="ds-breadcrumb" aria-label="Breadcrumb">
        <span>Inventory</span>
        <span className="ds-breadcrumb-sep">/</span>
        <span>Warehouses</span>
        <span className="ds-breadcrumb-sep">/</span>
        <span>Detail</span>
      </nav>

      <div className="ds-page-header">
        <div>
          <h1 className="ds-page-title" style={{ fontSize: 22 }}>
            {data ? data.name : 'Warehouse'}
          </h1>
          <p style={{ margin: '8px 0 0', fontWeight: 800, color: 'rgba(15,23,42,0.55)' }}>
            <Link to="/warehouses" className="ds-link-muted">
              ← Back to warehouses
            </Link>
          </p>
        </div>
        {canWrite && data ? (
          <div className="ds-detail-actions">
            <button type="button" className="ds-btn-primary" onClick={() => setEditOpen(true)}>
              Edit
            </button>
            <button type="button" className="ds-btn-danger" onClick={() => setDeleteOpen(true)}>
              Delete
            </button>
          </div>
        ) : null}
      </div>

      {!isValidId ? (
        <p style={{ marginTop: 14, color: '#dc2626', fontWeight: 900 }}>
          Invalid warehouse id: <strong>{warehouseId}</strong>
        </p>
      ) : isLoading ? (
        <p style={{ marginTop: 14, fontWeight: 800 }}>Loading warehouse...</p>
      ) : error ? (
        <p style={{ marginTop: 14, color: '#dc2626', fontWeight: 900 }}>
          Failed to load warehouse: {error.message}
        </p>
      ) : data ? (
        <>
          <div className="ds-detail-hero">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <span style={{ fontWeight: 900, fontSize: 14, color: 'rgba(15,23,42,0.55)' }}>
                {displayWarehouseCode(data)}
              </span>
              <span className={statusBadgeClass(data.status)}>{warehouseStatusLabel(data.status)}</span>
            </div>
          </div>

          <div className="ds-detail-grid">
            <div className="ds-detail-field">
              <div className="ds-detail-label">Location</div>
              <div className="ds-detail-value">{data.location}</div>
            </div>
            <div className="ds-detail-field">
              <div className="ds-detail-label">Region</div>
              <div className="ds-detail-value">{data.region?.trim() ? data.region : '—'}</div>
            </div>
            <div className="ds-detail-field">
              <div className="ds-detail-label">Maximum capacity</div>
              <div className="ds-detail-value">{formatM2(data.maxCapacityM2)}</div>
            </div>
            <div className="ds-detail-field">
              <div className="ds-detail-label">Occupied</div>
              <div className="ds-detail-value">{formatM2(data.occupiedM2)}</div>
            </div>
            <div className="ds-detail-field">
              <div className="ds-detail-label">Occupancy rate</div>
              <div className="ds-detail-value">{occ === null ? '—' : formatPercent(occ)}</div>
            </div>
            <div className="ds-detail-field">
              <div className="ds-detail-label">Contact</div>
              <div className="ds-detail-value">{formatWarehouseContact(data.contactNumber)}</div>
            </div>
          </div>

          <p style={{ marginTop: 18 }}>
            <Link className="ds-link-sub" to={`/storage-locations?warehouseId=${data.id}`}>
              View storage locations
            </Link>
          </p>
        </>
      ) : (
        <p style={{ marginTop: 14 }}>No data.</p>
      )}

      {editOpen && data ? (
        <WarehouseFormModal
          mode="edit"
          initial={data}
          onClose={() => setEditOpen(false)}
          onSaved={() => {
            refetch()
            setEditOpen(false)
          }}
        />
      ) : null}

      {deleteOpen && data ? (
        <WarehouseDeleteModal
          warehouse={data}
          onClose={() => setDeleteOpen(false)}
          onDeleted={() => navigate('/warehouses', { replace: true })}
        />
      ) : null}
    </div>
  )
}
