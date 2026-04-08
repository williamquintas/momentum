/**
 * Settings Page
 *
 * Page for app settings including language preferences and data import/export functionality.
 * Uses sectioned layout (Preferences, Data, About) with max-width container on desktop.
 */

import { Typography, List, Divider, Grid } from 'antd';
import { useTranslation } from 'react-i18next';

import { ImportExportSettings } from '@/features/settings/components/ImportExportSettings';
import { LanguageSettings } from '@/features/settings/components/LanguageSettings';
import { ThemeSettings } from '@/features/settings/components/ThemeSettings';

const { Title, Text } = Typography;

/**
 * SettingsPage Component
 *
 * Renders the settings page with sectioned layout and max-width on desktop.
 */
export const SettingsPage = (): React.ReactElement => {
  const { t } = useTranslation();
  const screens = Grid.useBreakpoint();
  const isDesktop = screens.lg;

  return (
    <div
      style={{ maxWidth: isDesktop ? 800 : undefined, margin: isDesktop ? '0 auto' : undefined, paddingTop: 24 }}
      className="settings-page"
    >
      <Title level={2} style={{ marginBottom: 32 }}>
        {t('settings.title')}
      </Title>

      <List
        header={
          <div>
            <Text type="secondary">{t('settings.preferences')}</Text>
          </div>
        }
        bordered={false}
        dataSource={[1]}
        renderItem={() => (
          <>
            <ThemeSettings />
            <LanguageSettings />
          </>
        )}
      />

      <Divider style={{ margin: '8px 0' }} />

      <List
        header={
          <div>
            <Text type="secondary">{t('settings.data')}</Text>
          </div>
        }
        bordered={false}
        dataSource={[1]}
        renderItem={() => <ImportExportSettings />}
      />
    </div>
  );
};

export default SettingsPage;
