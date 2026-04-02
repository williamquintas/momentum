/**
 * Settings Page
 *
 * Page for app settings including language preferences.
 */

import { Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import { LanguageSettings } from '@/features/settings/components/LanguageSettings';

const { Title } = Typography;

/**
 * SettingsPage Component
 *
 * Renders the settings page with language preferences.
 */
export const SettingsPage = (): React.ReactElement => {
  const { t } = useTranslation();

  return (
    <div>
      <Title level={2}>{t('settings.title')}</Title>
      <LanguageSettings />
    </div>
  );
};

export default SettingsPage;
