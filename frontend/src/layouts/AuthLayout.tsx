import { Outlet } from 'react-router-dom'

import './authLayout.css'

export function AuthLayout() {
  return (
    <div className="auth-theme">
      <main className="auth-main">
        <div className="auth-card">
          <section className="auth-card-left">
            <Outlet />
          </section>

          <aside className="auth-card-right" aria-hidden="true">
            <div className="auth-right-badge">WM</div>
            <h2 className="auth-right-title">Secure warehouse operations</h2>
            <p className="auth-right-subtitle">
              Inventory, stock movements, and audit-ready workflows—built for
              teams that need traceability.
            </p>

            <div className="auth-right-visual">
              <svg
                viewBox="0 0 520 340"
                className="auth-right-svg"
                role="presentation"
              >
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#60a5fa" stopOpacity="0.9" />
                    <stop offset="1" stopColor="#a78bfa" stopOpacity="0.9" />
                  </linearGradient>
                </defs>
                <rect x="24" y="18" width="472" height="304" rx="26" fill="#0b1220" opacity="0.55" />
                <rect x="64" y="58" width="392" height="220" rx="22" fill="url(#g1)" opacity="0.16" />
                <rect x="110" y="110" width="120" height="120" rx="18" fill="#a78bfa" opacity="0.35" />
                <rect x="252" y="90" width="150" height="150" rx="22" fill="#60a5fa" opacity="0.28" />
                <circle cx="400" cy="120" r="26" fill="#22c55e" opacity="0.35" />
                <path
                  d="M150 235 C190 200 260 260 300 220 C340 180 390 220 430 190"
                  stroke="#fde68a"
                  strokeWidth="10"
                  strokeLinecap="round"
                  opacity="0.35"
                  fill="none"
                />
              </svg>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

