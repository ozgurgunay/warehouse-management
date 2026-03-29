import { useEffect, useMemo, useState } from 'react'

import { getCategoryById } from '../../features/categories/api'
import { formatCategoryCode } from '../../features/categories/format'
import type { Category } from '../../features/categories/types'
import { getProductCatalog } from '../../features/products/api'
import type { ProductCatalogRow, StockStatusLabel } from '../../features/products/types'
import { isAbortError } from '../../services/apiClient'

import '../Admin/adminModals.css'
import './categoryModals.css'

type Props = {
  category: Category
  onClose: () => void
}

function stockHealth(rows: ProductCatalogRow[]): { label: string; tone: 'ok' | 'warn' | 'bad' } {
  if (rows.some((r) => r.stockStatus === 'OUT_OF_STOCK')) {
    return { label: 'Critical', tone: 'bad' }
  }
  if (rows.some((r) => r.stockStatus === 'LOW_STOCK')) {
    return { label: 'Low stock', tone: 'warn' }
  }
  return { label: 'Optimal', tone: 'ok' }
}

function stockRowPill(status: StockStatusLabel): { label: string; className: string } {
  if (status === 'IN_STOCK') return { label: 'Optimal', className: 'cat-view-pill cat-view-pill--ok' }
  if (status === 'LOW_STOCK') return { label: 'Low stock', className: 'cat-view-pill cat-view-pill--low' }
  return { label: 'Warning', className: 'cat-view-pill cat-view-pill--warn' }
}

function qtyClass(row: ProductCatalogRow): string {
  if (row.stockStatus === 'OUT_OF_STOCK') return 'cat-view-qty--low'
  if (row.stockStatus === 'LOW_STOCK') return 'cat-view-qty--mid'
  return ''
}

function IconCategoryHero() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 9v-7h7v7h-7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconDownload() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function CategoryViewModal({ category, onClose }: Props) {
  const [detail, setDetail] = useState<Category | null>(null)
  const [rows, setRows] = useState<ProductCatalogRow[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const ac = new AbortController()
    setLoading(true)
    setError(null)
    Promise.all([
      getCategoryById(category.id, ac.signal),
      getProductCatalog({ page: 0, size: 5000, categoryId: category.id }, ac.signal),
    ])
      .then(([c, page]) => {
        if (ac.signal.aborted) return
        setDetail(c)
        setRows(page.content)
        setTotalElements(page.totalElements)
      })
      .catch((e) => {
        if (isAbortError(e)) return
        setError(e instanceof Error ? e.message : 'Request failed')
      })
      .finally(() => {
        if (!ac.signal.aborted) setLoading(false)
      })
    return () => ac.abort()
  }, [category.id])

  const totalUnits = useMemo(() => rows.reduce((s, r) => s + r.totalAvailableUnits, 0), [rows])

  const health = useMemo(() => stockHealth(rows), [rows])

  const cat = detail ?? category
  const visibility = (cat.status ?? 'ACTIVE') === 'ACTIVE'

  const exportCsv = () => {
    const header = ['sku', 'name', 'qtyInStock', 'stockStatus']
    const lines = [
      header.join(','),
      ...rows.map((r) =>
        [r.sku, csvEscape(r.name), r.totalAvailableUnits, r.stockStatus].join(','),
      ),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `category-${cat.id}-products.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="admin-modal-overlay" role="presentation" onMouseDown={onClose}>
      <div
        className="cat-modal-shell cat-modal-shell--wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cat-view-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="cat-modal-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <h2 id="cat-view-title" className="cat-modal-title">
            Category details
          </h2>
          <button type="button" className="admin-modal-close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="cat-modal-body-scroll">
          {loading ? (
            <p style={{ margin: 0, fontWeight: 700 }}>Loading…</p>
          ) : error ? (
            <p style={{ margin: 0, color: '#b91c1c', fontWeight: 800 }}>{error}</p>
          ) : (
            <>
              <div className="cat-view-stat-row">
                <div className="cat-view-stat-card">
                  <div className="cat-view-stat-label">Total SKUs</div>
                  <div className="cat-view-stat-value">{totalElements.toLocaleString('en-US')}</div>
                </div>
                <div className="cat-view-stat-card">
                  <div className="cat-view-stat-label">Total stock quantity</div>
                  <div className="cat-view-stat-value">{totalUnits.toLocaleString('en-US')}</div>
                  <div className="cat-view-stat-value-sm">Units</div>
                </div>
                <div className="cat-view-stat-card">
                  <div className="cat-view-stat-label">Stock health</div>
                  <div className="cat-view-stat-pill">
                    <span
                      className={`cat-view-stat-dot ${
                        health.tone === 'ok'
                          ? 'cat-view-stat-dot--ok'
                          : health.tone === 'warn'
                            ? 'cat-view-stat-dot--warn'
                            : 'cat-view-stat-dot--bad'
                      }`}
                      aria-hidden
                    />
                    <span style={{ fontWeight: 900, fontSize: 14 }}>{health.label}</span>
                  </div>
                  <div className="cat-view-stat-value-sm" style={{ marginTop: 8 }}>
                    Visibility:{' '}
                    <strong style={{ color: visibility ? '#15803d' : '#64748b' }}>
                      {visibility ? 'Active' : 'Archived'}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="cat-view-hero">
                <div className="cat-view-hero-icon" aria-hidden>
                  <IconCategoryHero />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 900, color: 'var(--ds-muted)' }}>
                    {formatCategoryCode(cat.id)}
                  </p>
                  <h3 className="cat-view-hero-title">{cat.name}</h3>
                  <p className="cat-view-hero-desc">
                    {cat.description?.trim() ? cat.description : 'No description for this category.'}
                  </p>
                </div>
              </div>

              <div className="cat-view-section-head">
                <h4 className="cat-view-section-title">Assigned products</h4>
                <span className="cat-view-section-meta">
                  Showing {rows.length.toLocaleString('en-US')} of {totalElements.toLocaleString('en-US')} products
                </span>
              </div>

              {rows.length === 0 ? (
                <p className="app-muted" style={{ fontWeight: 700 }}>
                  No products in this category.
                </p>
              ) : (
                <div className="cat-view-table-wrap">
                  <table className="cat-view-table">
                    <thead>
                      <tr>
                        <th>SKU ID</th>
                        <th>Product name</th>
                        <th>Qty in stock</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => {
                        const pill = stockRowPill(r.stockStatus)
                        return (
                          <tr key={r.id}>
                            <td className="cat-view-sku">{r.sku}</td>
                            <td style={{ fontWeight: 800 }}>{r.name}</td>
                            <td className={qtyClass(r)}>{r.totalAvailableUnits.toLocaleString('en-US')}</td>
                            <td>
                              <span className={pill.className}>{pill.label}</span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        <div className="cat-modal-footer">
          <button type="button" className="ds-btn-ghost" onClick={exportCsv} disabled={loading || rows.length === 0}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <IconDownload />
              Export CSV
            </span>
          </button>
          <div className="cat-modal-footer-actions">
            <button type="button" className="ds-btn-primary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function csvEscape(s: string): string {
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}
