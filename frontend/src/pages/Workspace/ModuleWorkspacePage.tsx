import { Link, useLocation } from 'react-router-dom'

import { useAuth } from '../../auth/AuthContext'
import { getModuleDefinition } from './moduleRegistry'

import './moduleWorkspace.css'

export function ModuleWorkspacePage() {
  const location = useLocation()
  const { hasCapability } = useAuth()
  const mod = getModuleDefinition(location.pathname)

  return (
    <div className="app-panel">
      <div className="module-workspace-header">
        <div className="module-workspace-kicker">{mod.area}</div>
        <div className="module-workspace-title-row">
          <h1 className="module-workspace-title">{mod.title}</h1>
          <span className="module-workspace-badge">UI scaffold — REST ready</span>
        </div>
        <p className="module-workspace-desc">{mod.description}</p>
        <div className="module-workspace-api">
          Backend collection: <code>GET {mod.apiBase}</code> (and related verbs)
        </div>
      </div>

      <div className="module-workspace-grid">
        <div className="module-workspace-card">
          <div className="module-workspace-card-title">Planned screens</div>
          <ul>
            {mod.plannedFeatures.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
        <div className="module-workspace-card">
          <div className="module-workspace-card-title">Next implementation steps</div>
          <ul>
            <li>API client + React Query hooks</li>
            <li>List table with pagination &amp; filters</li>
            <li>Create / edit modal or routed form</li>
            <li>Map capabilities to buttons (read vs write)</li>
          </ul>
        </div>
      </div>

      <div className="module-workspace-actions">
        <Link to="/app" className="app-button-primary">
          Back to dashboard
        </Link>
        <Link to="/warehouses" className="app-button-secondary">
          Warehouses
        </Link>
        {hasCapability('admin.manage_users') ? (
          <Link to="/admin" className="app-button-secondary">
            Administration
          </Link>
        ) : null}
      </div>

      {mod.relatedRoutes && mod.relatedRoutes.length > 0 ? (
        <div className="module-workspace-related">
          Related modules
          <div className="module-workspace-related-links">
            {mod.relatedRoutes.map((r) => (
              <Link key={r.to} to={r.to} className="app-link-muted" style={{ fontWeight: 900 }}>
                {r.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <div className="module-workspace-note">
        User / profile and email verification flows are parked for now. Role-based hiding of menu items and actions will
        plug into <code>capabilities</code> when you wire each module.
      </div>
    </div>
  )
}
