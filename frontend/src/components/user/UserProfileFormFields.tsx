import type { UserCertification, UserEmergencyContact, UserProfilePayload } from '../../features/users/types'

type Variant = 'admin' | 'account'

const styles = (variant: Variant) => ({
  grid: variant === 'admin' ? 'admin-modal-field-grid' : 'account-two-col-row',
  label: variant === 'admin' ? 'admin-label' : 'account-form-label',
  input: variant === 'admin' ? 'admin-input' : 'account-input',
  sectionTitle: variant === 'admin' ? { fontWeight: 900 as const, fontSize: 13, marginTop: 16, marginBottom: 8 } : { fontWeight: 900 as const, fontSize: 14, marginTop: 16, marginBottom: 8 },
  muted: variant === 'admin' ? { fontSize: 12, color: 'rgba(15,23,42,0.55)', marginBottom: 8 } : { fontSize: 12, opacity: 0.75, marginBottom: 8 },
})

function Field({
  variant,
  label,
  children,
}: {
  variant: Variant
  label: string
  children: React.ReactNode
}) {
  const s = styles(variant)
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <div className={s.label}>{label}</div>
      {children}
    </label>
  )
}

export function UserProfileFormFields({
  value,
  onChange,
  variant = 'admin',
  omitFirstAndLastName = false,
  requireFirstAndLast = false,
}: {
  value: UserProfilePayload
  onChange: (next: UserProfilePayload) => void
  variant?: Variant
  /** When true, first/last name inputs are rendered elsewhere (e.g. create-user flow). */
  omitFirstAndLastName?: boolean
  /** HTML5 required + labels for first/last (profile save / account page). */
  requireFirstAndLast?: boolean
}) {
  const s = styles(variant)
  const v = value
  const set = (patch: Partial<UserProfilePayload>) => onChange({ ...v, ...patch })

  const emergencies = v.emergencyContacts ?? []
  const certs = v.certifications ?? []

  const updateEmergency = (index: number, patch: Partial<UserEmergencyContact>) => {
    const next = emergencies.map((row, i) => (i === index ? { ...row, ...patch } : row))
    set({ emergencyContacts: next })
  }

  const addEmergency = () => {
    set({
      emergencyContacts: [
        ...emergencies,
        { fullName: '', relationship: '', phonePrimary: '', phoneSecondary: '' },
      ],
    })
  }

  const removeEmergency = (index: number) => {
    set({ emergencyContacts: emergencies.filter((_, i) => i !== index) })
  }

  const updateCert = (index: number, patch: Partial<UserCertification>) => {
    const next = certs.map((row, i) => (i === index ? { ...row, ...patch } : row))
    set({ certifications: next })
  }

  const addCert = () => {
    set({
      certifications: [
        ...certs,
        { certificationType: '', certificateNumber: '', issuedAt: '', expiresAt: '', issuerName: '' },
      ],
    })
  }

  const removeCert = (index: number) => {
    set({ certifications: certs.filter((_, i) => i !== index) })
  }

  return (
    <div>
      <div style={s.sectionTitle}>Identity & contact</div>
      <div className={s.grid}>
        {!omitFirstAndLastName ? (
          <>
            <Field
              variant={variant}
              label={requireFirstAndLast ? 'First name (required)' : 'First name'}
            >
              <input
                className={s.input}
                value={v.firstName ?? ''}
                onChange={(e) => set({ firstName: e.target.value })}
                autoComplete="given-name"
                required={requireFirstAndLast}
              />
            </Field>
            <Field
              variant={variant}
              label={requireFirstAndLast ? 'Last name (required)' : 'Last name'}
            >
              <input
                className={s.input}
                value={v.lastName ?? ''}
                onChange={(e) => set({ lastName: e.target.value })}
                autoComplete="family-name"
                required={requireFirstAndLast}
              />
            </Field>
          </>
        ) : null}
        <Field variant={variant} label="Middle name">
          <input
            className={s.input}
            value={v.middleName ?? ''}
            onChange={(e) => set({ middleName: e.target.value })}
          />
        </Field>
        <Field variant={variant} label="Mobile phone">
          <input
            className={s.input}
            value={v.mobilePhone ?? ''}
            onChange={(e) => set({ mobilePhone: e.target.value })}
            autoComplete="tel"
          />
        </Field>
        <Field variant={variant} label="Work phone">
          <input
            className={s.input}
            value={v.workPhone ?? ''}
            onChange={(e) => set({ workPhone: e.target.value })}
          />
        </Field>
        <Field variant={variant} label="Birth date">
          <input
            className={s.input}
            type="date"
            value={v.birthDate ?? ''}
            onChange={(e) => set({ birthDate: e.target.value })}
          />
        </Field>
      </div>

      <div style={s.sectionTitle}>Employment</div>
      <div style={s.muted}>Employee number must be unique across active profiles.</div>
      <div className={s.grid}>
        <Field variant={variant} label="Employee number">
          <input
            className={s.input}
            value={v.employeeNumber ?? ''}
            onChange={(e) => set({ employeeNumber: e.target.value })}
          />
        </Field>
        <Field variant={variant} label="Department">
          <input
            className={s.input}
            value={v.department ?? ''}
            onChange={(e) => set({ department: e.target.value })}
          />
        </Field>
        <Field variant={variant} label="Job title">
          <input
            className={s.input}
            value={v.jobTitle ?? ''}
            onChange={(e) => set({ jobTitle: e.target.value })}
          />
        </Field>
        <Field variant={variant} label="Hire date">
          <input
            className={s.input}
            type="date"
            value={v.hireDate ?? ''}
            onChange={(e) => set({ hireDate: e.target.value })}
          />
        </Field>
      </div>

      <div style={s.sectionTitle}>Address</div>
      <div className={s.grid}>
        <Field variant={variant} label="Address line">
          <input
            className={s.input}
            value={v.addressLine1 ?? ''}
            onChange={(e) => set({ addressLine1: e.target.value })}
          />
        </Field>
        <Field variant={variant} label="City">
          <input
            className={s.input}
            value={v.city ?? ''}
            onChange={(e) => set({ city: e.target.value })}
          />
        </Field>
        <Field variant={variant} label="Postal code">
          <input
            className={s.input}
            value={v.postalCode ?? ''}
            onChange={(e) => set({ postalCode: e.target.value })}
          />
        </Field>
        <Field variant={variant} label="Country code (ISO-2)">
          <input
            className={s.input}
            maxLength={2}
            value={v.countryCode ?? ''}
            onChange={(e) => set({ countryCode: e.target.value.toUpperCase() })}
            placeholder="TR"
          />
        </Field>
      </div>

      <div style={s.sectionTitle}>Preferences & privacy</div>
      <div style={s.muted}>
        Store only the last 4 digits of a national ID if required — never the full number in plain text.
      </div>
      <div className={s.grid}>
        <Field variant={variant} label="Preferred locale">
          <input
            className={s.input}
            value={v.preferredLocale ?? ''}
            onChange={(e) => set({ preferredLocale: e.target.value })}
            placeholder="e.g. tr-TR"
          />
        </Field>
        <Field variant={variant} label="Time zone">
          <input
            className={s.input}
            value={v.timeZone ?? ''}
            onChange={(e) => set({ timeZone: e.target.value })}
            placeholder="Europe/Istanbul"
          />
        </Field>
        <Field variant={variant} label="National ID (last 4 digits max)">
          <input
            className={s.input}
            maxLength={4}
            value={v.nationalIdLastFour ?? ''}
            onChange={(e) => set({ nationalIdLastFour: e.target.value.replace(/\D/g, '').slice(0, 4) })}
          />
        </Field>
      </div>

      <div style={s.sectionTitle}>Emergency contacts</div>
      {emergencies.length === 0 ? (
        <div style={s.muted}>No contacts added.</div>
      ) : null}
      {emergencies.map((row, index) => (
        <div
          key={index}
          style={{
            border: '1px solid rgba(15,23,42,0.12)',
            borderRadius: 10,
            padding: 12,
            marginBottom: 10,
            display: 'grid',
            gap: 10,
          }}
        >
          <div className={s.grid}>
            <Field variant={variant} label="Full name">
              <input
                className={s.input}
                value={row.fullName}
                onChange={(e) => updateEmergency(index, { fullName: e.target.value })}
              />
            </Field>
            <Field variant={variant} label="Relationship">
              <input
                className={s.input}
                value={row.relationship ?? ''}
                onChange={(e) => updateEmergency(index, { relationship: e.target.value })}
              />
            </Field>
            <Field variant={variant} label="Primary phone">
              <input
                className={s.input}
                value={row.phonePrimary}
                onChange={(e) => updateEmergency(index, { phonePrimary: e.target.value })}
              />
            </Field>
            <Field variant={variant} label="Secondary phone">
              <input
                className={s.input}
                value={row.phoneSecondary ?? ''}
                onChange={(e) => updateEmergency(index, { phoneSecondary: e.target.value })}
              />
            </Field>
          </div>
          <button
            type="button"
            className={variant === 'admin' ? 'app-button-secondary' : 'account-action-button'}
            onClick={() => removeEmergency(index)}
          >
            Remove contact
          </button>
        </div>
      ))}
      <button
        type="button"
        className={variant === 'admin' ? 'app-button-secondary' : 'account-action-button'}
        onClick={addEmergency}
      >
        Add emergency contact
      </button>

      <div style={s.sectionTitle}>Certifications</div>
      {certs.length === 0 ? (
        <div style={s.muted}>No certifications added.</div>
      ) : null}
      {certs.map((row, index) => (
        <div
          key={index}
          style={{
            border: '1px solid rgba(15,23,42,0.12)',
            borderRadius: 10,
            padding: 12,
            marginBottom: 10,
            display: 'grid',
            gap: 10,
          }}
        >
          <div className={s.grid}>
            <Field variant={variant} label="Type">
              <input
                className={s.input}
                value={row.certificationType}
                onChange={(e) => updateCert(index, { certificationType: e.target.value })}
                placeholder="e.g. Forklift"
              />
            </Field>
            <Field variant={variant} label="Certificate number">
              <input
                className={s.input}
                value={row.certificateNumber ?? ''}
                onChange={(e) => updateCert(index, { certificateNumber: e.target.value })}
              />
            </Field>
            <Field variant={variant} label="Issued">
              <input
                className={s.input}
                type="date"
                value={row.issuedAt ?? ''}
                onChange={(e) => updateCert(index, { issuedAt: e.target.value })}
              />
            </Field>
            <Field variant={variant} label="Expires">
              <input
                className={s.input}
                type="date"
                value={row.expiresAt ?? ''}
                onChange={(e) => updateCert(index, { expiresAt: e.target.value })}
              />
            </Field>
            <Field variant={variant} label="Issuer">
              <input
                className={s.input}
                value={row.issuerName ?? ''}
                onChange={(e) => updateCert(index, { issuerName: e.target.value })}
              />
            </Field>
          </div>
          <button
            type="button"
            className={variant === 'admin' ? 'app-button-secondary' : 'account-action-button'}
            onClick={() => removeCert(index)}
          >
            Remove certification
          </button>
        </div>
      ))}
      <button
        type="button"
        className={variant === 'admin' ? 'app-button-secondary' : 'account-action-button'}
        onClick={addCert}
      >
        Add certification
      </button>
    </div>
  )
}
