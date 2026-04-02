/**
 * i18n Configuration
 *
 * Initializes i18next with language detection and React integration.
 * Supports English (default), Spanish, and Brazilian Portuguese.
 */

import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import en from './locales/en/translation.json';
import es from './locales/es/translation.json';
import ptBR from './locales/pt-br/translation.json';

/**
 * Supported languages with their display names and locales
 */
export const SUPPORTED_LANGUAGES = {
  en: { code: 'en', name: 'English', nativeName: 'English' },
  es: { code: 'es', name: 'Spanish', nativeName: 'Español' },
  'pt-BR': { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)' },
} as const;

/**
 * Type for supported language codes
 */
export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

/**
 * Default language
 */
export const DEFAULT_LANGUAGE = 'en' as const;

/**
 * i18n configuration options
 */
const i18nOptions = {
  resources: {
    en: { translation: en },
    es: { translation: es },
    'pt-BR': { translation: ptBR },
  },
  supportedLngs: ['en', 'es', 'pt-BR'],
  fallbackLng: DEFAULT_LANGUAGE,
  load: 'currentOnly' as const,
  debug: import.meta.env.DEV,

  // Language detection options
  detection: {
    order: ['localStorage', 'navigator', 'htmlTag'],
    caches: ['localStorage'],
    lookupLocalStorage: 'momentum-language',
  },

  // Interpolation options
  interpolation: {
    escapeValue: false, // React already escapes values
  },

  // React options
  react: {
    useSuspense: false,
  },
};

// Initialize i18next
void i18n.use(LanguageDetector).use(initReactI18next).init(i18nOptions);

export default i18n;

/**
 * Helper function to change language
 * @param language - Language code to switch to
 */
export const changeLanguage = async (language: SupportedLanguage): Promise<void> => {
  await i18n.changeLanguage(language);
  localStorage.setItem('momentum-language', language);
};

/**
 * Helper function to get current language
 * @returns Current language code
 */
export const getCurrentLanguage = (): SupportedLanguage => {
  return i18n.language as SupportedLanguage;
};
