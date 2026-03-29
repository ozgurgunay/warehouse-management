package com.example.warehousemanagement.entity.enums;

/**
 * Legal basis categories for recorded user consent (KVKK / GDPR-style traceability).
 * Each acceptance is stored as a {@link com.example.warehousemanagement.entity.UserConsent} row
 * with document version and timestamp.
 */
public enum ConsentType {

    /** Clarification text (aydınlatma) acknowledgement — mandatory when processing personal data. */
    PRIVACY_NOTICE,

    /** Contract / terms of use for system access. */
    TERMS_OF_USE,

    /** Explicit consent for employee / HR-related personal data in the warehouse context. */
    EMPLOYEE_PERSONAL_DATA,

    /** Optional: operational notifications (SMS/e-mail) unrelated to marketing. */
    OPERATIONAL_COMMUNICATION,

    /** Optional: marketing — must be separately opt-in where applicable. */
    MARKETING,

    /**
     * Account created by an authorized administrator on behalf of the organization
     * (document the legal basis in your policy text referenced by {@code documentVersion}).
     */
    ADMIN_PROVISIONED_ACCOUNT
}
