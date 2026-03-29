import { useEffect, useState } from 'react'

import { deleteProduct, getProductDetail } from '../../features/products/api'
import {
  formatMoneyUsd,
  stockStatusDisplay,
} from '../../features/products/format'
import { printProductLabel } from '../../features/products/printLabel'
import type { ProductDetail } from '../../features/products/types'
import type { ApiError } from '../../services/apiClient'

import { ProductDeleteConfirmModal } from './ProductDeleteConfirmModal'
import './productsCatalog.css'

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function DetailInner({
  detail,
  canWrite,
  onPrint,
  onExport,
  onEdit,
  onDelete,
}: {
  detail: ProductDetail
  canWrite: boolean
  onPrint: () => void
  onExport: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const st = stockStatusDisplay(detail.stockStatus)
  const pillStyle =
    st.tone === 'ok'
      ? { background: 'rgba(13,148,136,0.14)', color: '#0f766e', border: '1px solid rgba(13,148,136,0.35)' }
      : st.tone === 'warn'
        ? { background: 'rgba(234,88,12,0.12)', color: '#c2410c', border: '1px solid rgba(234,88,12,0.35)' }
        : { background: 'rgba(220,38,38,0.1)', color: '#b91c1c', border: '1px solid rgba(220,38,38,0.35)' }

  const fmtDt = (s: string | null) =>
    s
      ? new Date(s).toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '—'

  return (
    <>
      <nav className="ds-breadcrumb" aria-label="Breadcrumb">
        <span>Inventory</span>
        <span className="ds-breadcrumb-sep">/</span>
        <span>Products</span>
        <span className="ds-breadcrumb-sep">/</span>
        <span>{detail.sku}</span>
      </nav>

      <div className="pc-detail-header">
        <div>
          <span className="pc-status-pill" style={pillStyle}>
            {st.label}
          </span>
          <h2 className="pc-detail-title">{detail.name}</h2>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button type="button" className="ds-btn-ghost" onClick={onPrint}>
            Print label
          </button>
          <button type="button" className="ds-btn-ghost" onClick={onExport}>
            Export
          </button>
          <button type="button" className="ds-btn-primary" onClick={onEdit} disabled={!canWrite}>
            Edit product
          </button>
          <button type="button" className="ds-btn-danger" onClick={onDelete} disabled={!canWrite}>
            Delete
          </button>
        </div>
      </div>

      <div className="pc-detail-grid">
        <div className="pc-card">
          <div className="pc-card-title">Product overview</div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {detail.imageUrl ? (
              <img className="pc-product-img" src={detail.imageUrl} alt="" />
            ) : (
              <div className="pc-placeholder-img">No image</div>
            )}
            <div style={{ flex: 1, minWidth: 220 }}>
              <div className="pc-meta-grid">
                <div>
                  <div className="pc-meta-label">SKU</div>
                  <div className="pc-meta-value">{detail.sku}</div>
                </div>
                <div>
                  <div className="pc-meta-label">Category</div>
                  <div className="pc-meta-value">{detail.categoryName ?? '—'}</div>
                </div>
                <div>
                  <div className="pc-meta-label">Unit valuation</div>
                  <div className="pc-meta-value">{formatMoneyUsd(detail.price)}</div>
                </div>
                <div>
                  <div className="pc-meta-label">Manufacturer</div>
                  <div className="pc-meta-value">{detail.manufacturer ?? '—'}</div>
                </div>
              </div>
              <p style={{ margin: '14px 0 0', fontSize: 13, lineHeight: 1.5, color: 'rgba(15,23,42,0.75)' }}>
                {detail.description?.trim() || 'No description available.'}
              </p>
            </div>
          </div>
        </div>

        <div className="pc-card">
          <div className="pc-card-title">Identifiers</div>
          <div className="pc-symbology">
            <div className="pc-fake-qr" aria-hidden />
            <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.12em', color: 'var(--ds-muted)' }}>
              QR AUTH
            </div>
            <div className="pc-fake-bar" aria-hidden />
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.12em' }}>
              {detail.barcodeCode ?? detail.qrCodeValue ?? '—'}
            </div>
            {detail.qrCodeValue ? (
              <div style={{ marginTop: 6, fontSize: 11, color: 'var(--ds-muted)' }}>QR: {detail.qrCodeValue}</div>
            ) : null}
          </div>
        </div>

        <div className="pc-card">
          <div className="pc-card-title">Technical specifications</div>
          <div className="pc-spec-list">
            <div className="pc-spec-row">
              <span className="pc-meta-label">Dimensions</span>
              <span className="pc-meta-value">{detail.dimensionsText ?? '—'}</span>
            </div>
            <div className="pc-spec-row">
              <span className="pc-meta-label">Weight</span>
              <span className="pc-meta-value">
                {detail.weightKg != null ? `${detail.weightKg} kg` : '—'}
              </span>
            </div>
            <div className="pc-spec-row">
              <span className="pc-meta-label">Material</span>
              <span className="pc-meta-value">{detail.material ?? '—'}</span>
            </div>
            <div className="pc-spec-row">
              <span className="pc-meta-label">Operating temp</span>
              <span className="pc-meta-value">{detail.operatingTempRange ?? '—'}</span>
            </div>
            <div className="pc-spec-row">
              <span className="pc-meta-label">IP rating</span>
              <span className="pc-meta-value">{detail.ipRating ?? '—'}</span>
            </div>
          </div>
        </div>

        <div className="pc-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div className="pc-card-title" style={{ margin: 0 }}>
              Distribution &amp; storage
            </div>
            <button type="button" className="ds-btn-ghost" disabled title="Heatmap view (coming soon)">
              VIEW HEATMAP
            </button>
          </div>
          {detail.stockDistribution.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, color: 'var(--ds-muted)' }}>No inventory rows for this SKU.</p>
          ) : (
            <table className="pc-dist-table">
              <thead>
                <tr>
                  <th>Facility</th>
                  <th>Location (B/F/S)</th>
                  <th>Available qty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {detail.stockDistribution.map((row) => {
                  const rs = stockStatusDisplay(row.rowStatus)
                  return (
                    <tr key={`${row.warehouseId}-${row.locationBfs}`}>
                      <td style={{ fontWeight: 800 }}>{row.facilityName}</td>
                      <td>{row.locationBfs}</td>
                      <td>{row.availableUnits.toLocaleString('en-US')} units</td>
                      <td>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 900,
                            color: rs.tone === 'ok' ? '#059669' : rs.tone === 'warn' ? '#ea580c' : '#dc2626',
                          }}
                        >
                          {rs.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="pc-card" style={{ marginTop: 16 }}>
        <div className="pc-card-title">Transaction log &amp; movement history</div>
        {detail.movementHistory.length === 0 ? (
          <p style={{ margin: 0, fontSize: 13, color: 'var(--ds-muted)' }}>No stock movements recorded yet.</p>
        ) : (
          <div className="pc-timeline">
            {detail.movementHistory.map((m) => (
              <div key={m.id} className="pc-tl-item">
                <div className="pc-tl-dot" aria-hidden />
                <div>
                  <div className="pc-tl-title">
                    {m.movementType}
                    {m.reason ? ` — ${m.reason}` : ''}
                  </div>
                  <div className="pc-tl-sub">
                    {m.quantityChange >= 0 ? '+' : ''}
                    {m.quantityChange} units · {m.warehouseName}
                  </div>
                  <div className="pc-tl-meta">
                    {m.createdBy} · {fmtDt(m.movementDate)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export function ProductDetailModal({
  productId,
  onClose,
  onEdit,
  onDeleted,
  canWrite,
}: {
  productId: number
  onClose: () => void
  onEdit: (id: number) => void
  onDeleted?: () => void
  canWrite: boolean
}) {
  const [detail, setDetail] = useState<ProductDetail | null>(null)
  const [error, setError] = useState<ApiError | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    getProductDetail(productId, controller.signal)
      .then(setDetail)
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return
        setError(e as ApiError)
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [productId])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const onConfirmDelete = async () => {
    try {
      setDeleting(true)
      await deleteProduct(productId)
      onDeleted?.()
      setDeleteOpen(false)
      onClose()
    } catch (e: unknown) {
      setError(e as ApiError)
      setDeleteOpen(false)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="pc-detail-overlay" role="dialog" aria-modal="true" aria-labelledby="pc-detail-title">
        <div className="pc-detail">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div id="pc-detail-title" style={{ fontSize: 12, fontWeight: 900, color: 'var(--ds-muted)' }}>
              Product detail
            </div>
            <button type="button" className="ds-btn-ghost" onClick={onClose}>
              Close
            </button>
          </div>
          {loading ? <p className="app-muted">Loading…</p> : null}
          {error && !deleteOpen ? (
            <p style={{ color: '#dc2626', fontWeight: 800 }}>{error.message}</p>
          ) : null}
          {!loading && detail ? (
            <DetailInner
              detail={detail}
              canWrite={canWrite}
              onPrint={() =>
                printProductLabel({
                  sku: detail.sku,
                  name: detail.name,
                  barcodeText: detail.barcodeCode,
                  qrText: detail.qrCodeValue,
                })
              }
              onExport={() =>
                downloadJson(`product-${detail.sku}-${productId}.json`, detail)
              }
              onEdit={() => {
                onEdit(productId)
              }}
              onDelete={() => setDeleteOpen(true)}
            />
          ) : null}
        </div>
      </div>

      {deleteOpen ? (
        <ProductDeleteConfirmModal
          title="Delete product"
          message={`Delete ${detail?.sku ?? 'this product'}? This may fail if inventory or orders still reference it.`}
          onConfirm={() => void onConfirmDelete()}
          onClose={() => setDeleteOpen(false)}
          isDeleting={deleting}
        />
      ) : null}
    </>
  )
}
