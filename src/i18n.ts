/**
 * i18n Configuration
 *
 * Initializes i18next with language detection and React integration.
 * Supports English, Spanish, Portuguese (Brazil), Mandarin, Hindi, French,
 * Russian, German, Japanese, and Korean.
 */

import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import de from './locales/de/translation.json';
import en from './locales/en/translation.json';
import es from './locales/es/translation.json';
import fr from './locales/fr/translation.json';
import hi from './locales/hi/translation.json';
import ja from './locales/ja/translation.json';
import ko from './locales/ko/translation.json';
import ptBR from './locales/pt-br/translation.json';
import ru from './locales/ru/translation.json';
import zh from './locales/zh/translation.json';

/**
 * Supported languages with their display names and locales
 * Ordered alphabetically by native name
 */
export const SUPPORTED_LANGUAGES = {
  de: { code: 'de', name: 'German', nativeName: 'Deutsch' },
  en: { code: 'en', name: 'English', nativeName: 'English' },
  es: { code: 'es', name: 'Spanish', nativeName: 'Español' },
  fr: { code: 'fr', name: 'French', nativeName: 'Français' },
  hi: { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  ja: { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  ko: { code: 'ko', name: 'Korean', nativeName: '한국어' },
  'pt-BR': { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)' },
  ru: { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  zh: { code: 'zh', name: 'Mandarin', nativeName: '中文' },
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
    de: { translation: de },
    en: { translation: en },
    es: { translation: es },
    fr: { translation: fr },
    hi: { translation: hi },
    ja: { translation: ja },
    ko: { translation: ko },
    'pt-BR': { translation: ptBR },
    ru: { translation: ru },
    zh: { translation: zh },
  },
  supportedLngs: ['de', 'en', 'es', 'fr', 'hi', 'ja', 'ko', 'pt-BR', 'ru', 'zh'],
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
