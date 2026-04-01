/**
 * LanguageSwitcher Component
 *
 * A dropdown component for switching between supported languages.
 * Uses country-flag-icons for flag display.
 */

import React from 'react';

import { Select, Space } from 'antd';
import * as FlagIcons from 'country-flag-icons/react/3x2';
import { useTranslation } from 'react-i18next';

import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/i18n';

// Map language codes to country codes for flags
const LANGUAGE_COUNTRY_CODES: Record<SupportedLanguage, string> = {
  'pt-br': 'BR',
  en: 'US',
  es: 'ES',
};

const getFlagComponent = (countryCode: string) => {
  const FlagIcon = (FlagIcons as Record<string, React.FC<{ className?: string }>>)[countryCode];
  return FlagIcon ? (
    <span style={{ display: 'inline-flex', width: 20, height: 14 }}>
      <FlagIcon className="flag-icon" />
    </span>
  ) : null;
};

const LANGUAGE_OPTIONS = Object.entries(SUPPORTED_LANGUAGES).map(([code, info]) => ({
  value: code,
  label: (
    <Space aria-label={info.nativeName.toString()}>
      {getFlagComponent(LANGUAGE_COUNTRY_CODES[code as SupportedLanguage])}
    </Space>
  ),
}));

/**
 * LanguageSwitcher Component
 *
 * Renders a language selector dropdown in the header/settings.
 */
export const LanguageSwitcher = (): React.ReactElement => {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (value: SupportedLanguage): void => {
    void i18n.changeLanguage(value);
    localStorage.setItem('momentum-language', value);
  };

  return (
    <Select
      value={i18n.language as SupportedLanguage}
      onChange={handleLanguageChange}
      options={LANGUAGE_OPTIONS}
      placeholder={t('settings.language')}
      aria-label={t('accessibility.languageSelector')}
    />
  );
};

export default LanguageSwitcher;
