/**
 * Cookie Consent Utility
 *
 * Utility functions for managing cookie consent status.
 * Used by storage services to check if localStorage operations are allowed.
 */

export const COOKIE_CONSENT_KEY = 'cookie-consent';
export const COOKIE_CONSENT_EXPIRY_DAYS = 365;

/**
 * Cookie consent preference type
 */
export type CookieConsentStatus = 'accepted' | 'rejected' | null;

/**
 * Stored cookie consent data structure
 */
interface StoredCookieConsent {
  status: 'accepted' | 'rejected';
  expiryDate: string;
  timestamp?: string;
}

/**
 * Get cookie consent status from localStorage
 */
export const getCookieConsent = (): CookieConsentStatus => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as unknown;

    // Type guard to check if parsed data has the expected structure
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'status' in parsed &&
      'expiryDate' in parsed &&
      typeof (parsed as StoredCookieConsent).expiryDate === 'string'
    ) {
      const consentData = parsed as StoredCookieConsent;
      const expiryDate = new Date(consentData.expiryDate);

      // Check if consent has expired
      if (expiryDate < new Date()) {
        localStorage.removeItem(COOKIE_CONSENT_KEY);
        return null;
      }

      return consentData.status as CookieConsentStatus;
    }

    // Invalid data structure, remove it
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    return null;
  } catch {
    // If parsing fails, remove invalid data
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    return null;
  }
};

/**
 * Save cookie consent status to localStorage
 */
export const saveCookieConsent = (status: 'accepted' | 'rejected'): void => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + COOKIE_CONSENT_EXPIRY_DAYS);

    const data = {
      status,
      expiryDate: expiryDate.toISOString(),
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save cookie consent:', error);
  }
};

/**
 * Check if storage operations are allowed based on consent
 */
export const canUseStorage = (): boolean => {
  const consent = getCookieConsent();
  // Only allow storage if consent is explicitly accepted
  return consent === 'accepted';
};

/**
 * Clear all non-essential localStorage data
 * Preserves only the cookie consent preference
 */
export const clearNonEssentialStorage = (): void => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    // Save consent data
    const consentData = localStorage.getItem(COOKIE_CONSENT_KEY);

    // Clear all localStorage
    localStorage.clear();

    // Restore consent data if it exists
    if (consentData) {
      localStorage.setItem(COOKIE_CONSENT_KEY, consentData);
    }
  } catch (error) {
    console.error('Failed to clear non-essential storage:', error);
  }
};

/**
 * Reset consent (remove consent preference)
 * This will cause the consent banner to show again
 */
export const resetCookieConsent = (): void => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
  } catch (error) {
    console.error('Failed to reset cookie consent:', error);
  }
};
