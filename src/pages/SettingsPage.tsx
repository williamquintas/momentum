/**
 * Settings Page
 *
 * Page for app settings including language preferences and data import/export functionality.
 */

import { Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import { ImportExportSettings } from '@/features/settings/components/ImportExportSettings';
import { LanguageSettings } from '@/features/settings/components/LanguageSettings';
import { ThemeSettings } from '@/features/settings/components/ThemeSettings';

const { Title } = Typography;

/**
 * SettingsPage Component
 *
 * Renders the settings page with language preferences and import/export functionality.
 */
export const SettingsPage = (): React.ReactElement => {
  const { t } = useTranslation();

  return (
    <div>
      <Title level={2}>{t('settings.title')}</Title>
      <ThemeSettings />
      <LanguageSettings />
      <ImportExportSettings />
    </div>
  );
};

export default SettingsPage;
