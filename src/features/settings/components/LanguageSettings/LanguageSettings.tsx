/**
 * LanguageSettings Component
 *
 * Settings section for language selection in the Settings page.
 */

import React from 'react';

import { Card, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';

const { Text } = Typography;

/**
 * LanguageSettings Component
 *
 * Provides language selection as part of the settings.
 */
export const LanguageSettings = (): React.ReactElement => {
  const { t } = useTranslation();

  return (
    <Card title={t('settings.language')} size="small" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'space-between' }}>
        <Text>{t('settings.selectLanguage')}</Text>
        <LanguageSwitcher />
      </div>
    </Card>
  );
};

export default LanguageSettings;
