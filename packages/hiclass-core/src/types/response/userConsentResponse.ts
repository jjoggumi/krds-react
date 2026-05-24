export interface UserConsentInfoItem {
  consentType: string;
  title: string;
  required: boolean;
  selectType?: string;
}

export interface UserConsentInfoResponse {
  _embedded: {
    consents: UserConsentInfoItem[];
  }
}

export interface UserConsentAgreementResponse {
  isAgreed: boolean;
}

export interface UserSensitiveItem {
  consentType: string;
  title: string;
  required: boolean;
  selectType?: string;
  isAgreed: boolean;
  consentTimestamp: number;
}

export interface UserConsentSensitivesResponse {
  _embedded: {
    consents: UserSensitiveItem[];
  }
}