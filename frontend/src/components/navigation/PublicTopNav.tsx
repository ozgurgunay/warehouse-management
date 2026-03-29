import { Link } from 'react-router-dom'

export function PublicTopNav() {
  return (
    <header className="public-topbar" role="banner">
      <div className="public-topbar-inner">
        <div className="public-logo" aria-label="Warehouse Management">
          <div className="public-logo-mark" aria-hidden="true">
            WM
          </div>
          <div className="public-logo-text">WAREHOUSE</div>
        </div>

        <nav className="public-topnav" aria-label="Public navigation">
          <a className="public-topnav-link" href="#">
            Warehouses
          </a>
          <a className="public-topnav-link" href="#">
            Inventory
          </a>
          <a className="public-topnav-link" href="#">
            Movements
          </a>
          <a className="public-topnav-link" href="#">
            Security
          </a>
        </nav>

        <div className="public-topbar-actions">
          <Link to="/login" className="public-topbar-login">
            Log in
          </Link>
          <a className="public-topbar-cta" href="#">
            Book a demo
          </a>
        </div>
      </div>
    </header>
  )
}

