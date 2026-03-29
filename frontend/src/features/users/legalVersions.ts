/**
 * Must match backend {@code LegalDocumentVersions} and consent validation rules.
 */
export const LEGAL_DOC_VERSIONS = {
  privacyNotice: 'privacy-notice-v1',
  termsOfUse: 'terms-of-use-v1',
  employeePersonalData: 'employee-personal-data-v1',
} as const
