import './landing.css'

export function LandingPage() {
  return (
    <div className="landing">
      <section className="landing-hero" aria-label="Landing hero">
        <div className="landing-hero-inner">
          <div className="landing-hero-copy">
            <div className="landing-pill">Warehouse Management System</div>
            <h1 className="landing-title">
              Reduce operational risk by design
            </h1>
            <p className="landing-subtitle">
              Inventory, stock movements, and orders—built for traceability,
              role-based access, and audit-ready workflows.
            </p>

            <div className="landing-hero-mini">
              <div className="landing-hero-mini-item">Traceable inventory</div>
              <div className="landing-hero-mini-item">Secure workflows</div>
              <div className="landing-hero-mini-item">Audit-friendly</div>
            </div>

            <div className="landing-hero-actions">
              <a className="landing-primary-button" href="#">
                Book a demo
              </a>
            </div>
          </div>

          <div className="landing-hero-visual" aria-hidden="true">
            <svg viewBox="0 0 1200 420" className="landing-hero-svg">
              <defs>
                <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#eaf2ff" />
                  <stop offset="1" stopColor="#fef3c7" />
                </linearGradient>
                <linearGradient id="hill1" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#7c3aed" />
                  <stop offset="1" stopColor="#6366f1" />
                </linearGradient>
                <linearGradient id="hill2" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#22c55e" />
                  <stop offset="1" stopColor="#16a34a" />
                </linearGradient>
              </defs>

              <rect x="0" y="0" width="1200" height="420" fill="url(#sky)" />

              <path
                d="M0,290 C170,250 250,310 400,295 C540,281 610,235 760,245 C915,257 980,320 1200,300 L1200,420 L0,420 Z"
                fill="url(#hill1)"
                opacity="0.35"
              />
              <path
                d="M0,315 C220,270 320,360 470,330 C610,301 730,255 920,285 C1040,304 1110,345 1200,330 L1200,420 L0,420 Z"
                fill="url(#hill2)"
                opacity="0.55"
              />

              {/* Decorative “warehouse skyline” */}
              <g opacity="0.9">
                <rect x="90" y="255" width="70" height="70" rx="10" fill="#111827" opacity="0.18" />
                <rect x="180" y="235" width="100" height="90" rx="14" fill="#111827" opacity="0.14" />
                <rect x="300" y="260" width="75" height="65" rx="12" fill="#111827" opacity="0.17" />
                <rect x="410" y="240" width="110" height="85" rx="16" fill="#111827" opacity="0.12" />
              </g>

              {/* Sun */}
              <circle cx="860" cy="90" r="52" fill="#f59e0b" opacity="0.55" />
            </svg>
          </div>
        </div>
      </section>

      <section className="landing-modules" aria-label="Key modules">
        <div className="landing-modules-inner">
          <h2 className="landing-modules-title">Core modules</h2>
          <p className="landing-modules-subtitle">
            Everything teams need to run warehouses consistently—from setup to
            day-to-day execution.
          </p>

          <div className="landing-feature-grid">
            <div className="landing-feature-card">
              <div className="landing-feature-icon" aria-hidden="true">
                W
              </div>
              <h3 className="landing-feature-title">Warehouses</h3>
              <p className="landing-feature-text">
                Manage locations and capacity with clean, structured data.
              </p>
            </div>
            <div className="landing-feature-card">
              <div className="landing-feature-icon" aria-hidden="true">
                I
              </div>
              <h3 className="landing-feature-title">Inventory</h3>
              <p className="landing-feature-text">
                See stock status across SKUs, locations, and availability.
              </p>
            </div>
            <div className="landing-feature-card">
              <div className="landing-feature-icon" aria-hidden="true">
                M
              </div>
              <h3 className="landing-feature-title">Movements</h3>
              <p className="landing-feature-text">
                Track inbound/outbound operations with clear audit trails.
              </p>
            </div>
            <div className="landing-feature-card">
              <div className="landing-feature-icon" aria-hidden="true">
                O
              </div>
              <h3 className="landing-feature-title">Orders</h3>
              <p className="landing-feature-text">
                Coordinate demand with fulfillment and inventory impact.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

