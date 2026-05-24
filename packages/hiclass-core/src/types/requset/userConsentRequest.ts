export interface UserConsentAgreement {
  consentType: string;
  isAgreed: boolean;
}

export interface UserConsentAgreementRequest {
  consents: UserConsentAgreement[];
}
