import { AccountLayout } from './AccountLayout'

export function SettingsPage() {
  return (
    <AccountLayout active="settings">
      <div className="account-page-section-title">Settings</div>

      <div className="account-card">
        <div className="account-card-header">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 14, fontWeight: 900 }}>Account preferences</div>
            <div style={{ fontSize: 12, fontWeight: 900, color: 'rgba(15, 23, 42, 0.6)' }}>
              This UI is ready. Backend persistence will be added later.
            </div>
          </div>
        </div>

        <div className="account-form-grid" style={{ marginTop: 18 }}>
          <label className="account-form-field" style={{ gap: 10 }}>
            <div className="account-form-label">Email notifications</div>
            <input type="checkbox" defaultChecked />
          </label>
          <label className="account-form-field" style={{ gap: 10 }}>
            <div className="account-form-label">Security alerts</div>
            <input type="checkbox" defaultChecked />
          </label>
          <label className="account-form-field" style={{ gap: 10 }}>
            <div className="account-form-label">Warehouse updates</div>
            <input type="checkbox" defaultChecked />
          </label>
          <label className="account-form-field" style={{ gap: 10 }}>
            <div className="account-form-label">Weekly summary</div>
            <input type="checkbox" />
          </label>
        </div>

        <div className="account-form-actions">
          <button type="button" className="account-action-button">
            Cancel
          </button>
          <button
            type="button"
            className="account-action-button account-action-button--primary"
          >
            Save
          </button>
        </div>
      </div>
    </AccountLayout>
  )
}

