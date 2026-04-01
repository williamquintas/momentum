/**
 * LanguageSettings Component
 *
 * Settings section for language selection in the Settings page.
 */

import React from 'react';

import { Card, Typography } from 'antd';

import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';

const { Text } = Typography;

/**
 * LanguageSettings Component
 *
 * Provides language selection as part of the settings.
 */
export const LanguageSettings = (): React.ReactElement => {
  return (
    <Card title="Language" size="small" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Text>Select your preferred language:</Text>
        <LanguageSwitcher />
      </div>
    </Card>
  );
};

export default LanguageSettings;
