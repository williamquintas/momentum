/**
 * LanguageSwitcher Component
 *
 * A dropdown component for switching between supported languages.
 * Uses Ant Design's built-in i18n support.
 */

import React from 'react';

import { GlobalOutlined } from '@ant-design/icons';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';

import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '../i18n';

const LANGUAGE_OPTIONS = Object.entries(SUPPORTED_LANGUAGES).map(([code, info]) => ({
  value: code,
  label: info.nativeName,
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
      suffixIcon={<GlobalOutlined />}
      placeholder={t('settings.language')}
      style={{ width: 180 }}
      aria-label={t('accessibility.languageSelector')}
    />
  );
};

export default LanguageSwitcher;
