/**
 * ThemeSettings Component
 *
 * Settings section for theme selection in the Settings page.
 */

import React from 'react';

import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { Card, Switch, Tooltip, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/hooks/useTheme';

const { Text } = Typography;

/**
 * ThemeSettings Component
 *
 * Provides theme toggle as part of the settings.
 */
export const ThemeSettings = (): React.ReactElement => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  const isDark = theme === 'dark';

  return (
    <Card title={t('settings.theme')} size="small" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Text>
          {t('settings.chooseTheme')}: {isDark ? t('settings.darkMode') : t('settings.lightMode')}
        </Text>
        <Tooltip title={isDark ? t('theme.toggleLight') : t('theme.toggleDark')}>
          <Switch
            checked={isDark}
            onChange={toggleTheme}
            checkedChildren={<MoonOutlined />}
            unCheckedChildren={<SunOutlined />}
          />
        </Tooltip>
      </div>
    </Card>
  );
};

export default ThemeSettings;
