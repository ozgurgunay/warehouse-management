import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../../auth/AuthContext'
import { deleteCustomer, listCustomers } from '../../features/customers/api'
import type { CustomerDto } from '../../features/customers/types'
import { isAbortError, type ApiError } from '../../services/apiClient'

import { CustomerDeleteModal } from './CustomerDeleteModal'
import { CustomerFormModal } from './CustomerFormModal'
import './customersPage.css'

const PAGE_SIZE = 12

function IconPencil() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 20h4l10.5-10.5a2 2 0 0 0 0-2.83l-1.67-1.67a2 2 0 0 0-2.83 0L4 15.5V20Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconTrash() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 7h12M10 11v6M14 11v6M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M8 7h8l-1 13a1 1 0 0 1-1 1H10a1 1 0 0 1-1-1L8 7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function truncate(s: string | null | undefined, max: number) {
  const t = (s ?? '').trim()
  if (!t) return '—'
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`
}

export function CustomersPage() {
  const { hasCapability } = useAuth()
  const canWrite = hasCapability('sales.write')

  const [rows, setRows] = useState<CustomerDto[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [reloadTick, setReloadTick] = useState(0)

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null)
  const [editId, setEditId] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CustomerDto | null>(null)
  const [deleteWorking, setDeleteWorking] = useState(false)

  const refresh = useCallback(() => setReloadTick((x) => x + 1), [])

  useEffect(() => {
    let isCurrent = true
    const ac = new AbortController()
    setLoading(true)
    setLoadError(null)
    listCustomers(ac.signal)
      .then((data) => {
        if (!isCurrent) return
        setRows(data)
      })
      .catch((e) => {
        if (!isCurrent) return
        if (isAbortError(e)) return
        setLoadError((e as ApiError).message)
      })
      .finally(() => {
        if (isCurrent) setLoading(false)
      })
    return () => {
      isCurrent = false
      ac.abort()
    }
  }, [reloadTick])

  const filtered = useMemo(() => {
    if (!rows) return []
    const q = search.trim().toLowerCase()
    if (!q) return [...rows].sort((a, b) => a.id - b.id)
    return rows
      .filter((c) => {
        const hay = `${c.fullName} ${c.email ?? ''} ${c.phone ?? ''} ${c.companyName ?? ''}`.toLowerCase()
        return hay.includes(q)
      })
      .sort((a, b) => a.id - b.id)
  }, [rows, search])

  useEffect(() => {
    setPage(1)
  }, [search, rows?.length])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const paged = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, safePage])

  useEffect(() => {
    if (page !== safePage) setPage(safePage)
  }, [page, safePage])

  const showingFrom = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const showingTo = Math.min(filtered.length, safePage * PAGE_SIZE)

  const runDelete = async () => {
    if (!deleteTarget) return
    setDeleteWorking(true)
    try {
      await deleteCustomer(deleteTarget.id)
      setDeleteTarget(null)
      refresh()
    } catch (e) {
      window.alert((e as ApiError).message ?? 'Delete failed')
    } finally {
      setDeleteWorking(false)
    }
  }

  return (
    <div className="ds-page">
      <nav className="ds-breadcrumb" aria-label="Breadcrumb">
        <span>Sales</span>
        <span className="ds-breadcrumb-sep">/</span>
        <span>Customers</span>
      </nav>

      <div className="ds-page-header cu-page-header">
        <div>
          <h1 className="ds-page-title">CUSTOMERS</h1>
          <p className="cu-page-subtitle">
            Sold-to accounts for orders: contact details, company, and billing-related fields.
          </p>
        </div>
        <div className="cu-header-actions">
          <button type="button" className="ds-btn-ghost" onClick={refresh} disabled={loading}>
            Refresh
          </button>
          {canWrite ? (
            <button
              type="button"
              className="ds-btn-primary"
              onClick={() => {
                setEditId(null)
                setFormMode('create')
              }}
            >
              New customer
            </button>
          ) : null}
        </div>
      </div>

      <div className="ds-stat-grid cu-stat-grid">
        <div className="ds-stat-card">
          <div className="ds-stat-label">Total customers</div>
          <div className="ds-stat-value">{loading ? '…' : (rows?.length ?? 0)}</div>
        </div>
        <div className="ds-stat-card">
          <div className="ds-stat-label">Matching filter</div>
          <div className="ds-stat-value">{loading ? '…' : filtered.length}</div>
        </div>
        <div className="ds-stat-card">
          <div className="ds-stat-label">Related</div>
          <div className="ds-stat-value" style={{ fontSize: 14, fontWeight: 800 }}>
            <Link to="/orders" className="ds-link-accent">
              Orders
            </Link>
          </div>
        </div>
      </div>

      <div className="ds-toolbar cu-toolbar">
        <input
          type="search"
          className="ds-search-input cu-search"
          placeholder="Search name, email, phone, company…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search customers"
        />
      </div>

      {loading ? (
        <p className="app-muted" style={{ marginTop: 12 }}>
          Loading customers…
        </p>
      ) : loadError ? (
        <div style={{ marginTop: 12 }}>
          <p style={{ color: '#dc2626', fontWeight: 900 }}>Failed to load: {loadError}</p>
          <button type="button" className="ds-btn-primary" onClick={refresh}>
            Try again
          </button>
        </div>
      ) : !rows || rows.length === 0 ? (
        <p style={{ marginTop: 12, fontWeight: 800 }}>No customers yet.</p>
      ) : filtered.length === 0 ? (
        <p className="app-muted" style={{ marginTop: 12 }}>
          No customers match your search.
        </p>
      ) : (
        <>
          <div className="ds-table-wrap">
            <table className="ds-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Company</th>
                  <th>Tax #</th>
                  <th>Address</th>
                  <th className="ds-table__col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontVariantNumeric: 'tabular-nums' }}>{c.id}</td>
                    <td style={{ fontWeight: 900 }}>{c.fullName}</td>
                    <td>{c.email?.trim() || '—'}</td>
                    <td className="cu-nowrap">{c.phone?.trim() || '—'}</td>
                    <td>{c.companyName?.trim() || '—'}</td>
                    <td className="cu-mono">{c.taxNumber?.trim() || '—'}</td>
                    <td className="cu-address" title={c.address?.trim() || undefined}>
                      {truncate(c.address, 48)}
                    </td>
                    <td className="ds-table__col-actions">
                      <div className="ds-table-actions">
                        {canWrite ? (
                          <>
                            <button
                              type="button"
                              className="ds-row-action"
                              title="Edit"
                              aria-label={`Edit ${c.fullName}`}
                              onClick={() => {
                                setEditId(c.id)
                                setFormMode('edit')
                              }}
                            >
                              <IconPencil />
                            </button>
                            <button
                              type="button"
                              className="ds-row-action ds-row-action--danger"
                              title="Delete"
                              aria-label={`Delete ${c.fullName}`}
                              onClick={() => setDeleteTarget(c)}
                            >
                              <IconTrash />
                            </button>
                          </>
                        ) : (
                          <span className="app-muted" style={{ fontSize: 12 }}>
                            —
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="ds-pagination">
            <div className="ds-pagination-summary">
              Showing {showingFrom}-{showingTo} of {filtered.length} customers
            </div>
            <div className="ds-pagination-buttons">
              <button
                type="button"
                className="ds-page-btn"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </button>
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`ds-page-btn ${n === safePage ? 'ds-page-btn--active' : ''}`}
                  onClick={() => setPage(n)}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                className="ds-page-btn"
                disabled={safePage >= pageCount}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {formMode ? (
        <CustomerFormModal
          mode={formMode}
          customerId={editId ?? undefined}
          onClose={() => {
            setFormMode(null)
            setEditId(null)
          }}
          onSaved={refresh}
        />
      ) : null}

      {deleteTarget ? (
        <CustomerDeleteModal
          customerName={deleteTarget.fullName}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => void runDelete()}
          isDeleting={deleteWorking}
        />
      ) : null}
    </div>
  )
}
