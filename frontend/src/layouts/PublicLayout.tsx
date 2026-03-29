import { Outlet } from 'react-router-dom'

import { PublicTopNav } from '../components/navigation/PublicTopNav.tsx'
import './publicLayout.css'

export function PublicLayout() {
  return (
    <div className="public-theme">
      <PublicTopNav />
      <main className="public-main">
        <Outlet />
      </main>
    </div>
  )
}

