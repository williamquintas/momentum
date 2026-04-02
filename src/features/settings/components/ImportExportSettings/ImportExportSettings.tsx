/**
 * Import Export Settings Component
 *
 * UI for exporting and importing goals data in JSON format.
 * Uses Ant Design components for consistent styling.
 */

import { useState, useCallback } from 'react';

import { DownloadOutlined, UploadOutlined, WarningOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Modal, message, Card, Alert, Space, Typography, Divider } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { exportGoals, downloadExport } from '@/services/storage/dataExportService';
import {
  parseImportJson,
  validateImportData,
  importGoals,
  previewImport,
  ImportValidationError,
  importDataSchema,
  type DuplicateStrategy,
} from '@/services/storage/dataImportService';
import { queryKeys } from '@/utils/queryKeys';

const { Title, Text } = Typography;

/**
 * Validated import data type
 */
type ValidatedImportData = z.infer<typeof importDataSchema>;

/**
 * Import preview result
 */
interface ImportPreview {
  newGoals: number;
  duplicates: number;
  validatedData: ValidatedImportData;
}

/**
 * ImportExportSettings Component
 *
 * Provides UI for:
 * - Exporting goals to JSON file
 * - Importing goals from JSON file with validation and duplicate handling
 */
export const ImportExportSettings = (): React.ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<DuplicateStrategy>('latest-wins');

  /**
   * Handle export button click
   */
  const handleExport = useCallback(() => {
    const result = exportGoals();

    if (result.success && result.data) {
      downloadExport(result.data);
      message.success(t('settings.importExport.success', { count: result.data.goals.length }));
    } else {
      message.error(t('settings.importExport.error'));
    }
  }, [t]);

  /**
   * Handle file selection for import
   */
  const handleFileSelect = useCallback(
    async (file: File): Promise<void> => {
      try {
        const jsonString = await file.text();
        const parsedData = parseImportJson(jsonString);
        const validatedData = validateImportData(parsedData);
        const preview = previewImport(validatedData);

        setImportPreview({
          newGoals: preview.newGoals,
          duplicates: preview.duplicates,
          validatedData,
        });
      } catch (error) {
        if (error instanceof ImportValidationError) {
          const errorMessages = (error.errors as unknown as { path: string[]; message: string }[])
            .map((e) => `${e.path.join('.')}: ${e.message}`)
            .join(', ');
          message.error(t('settings.importExport.validationError', { errors: errorMessages }));
        } else {
          message.error(t('settings.importExport.parseError'));
        }
        setImportPreview(null);
      }
    },
    [t]
  );

  /**
   * Handle import confirmation
   */
  const handleImportConfirm = useCallback(() => {
    if (!importPreview) return;

    setIsImporting(true);
    try {
      const result = importGoals(importPreview.validatedData, selectedStrategy);

      if (result.success) {
        message.success(
          t('settings.importExport.importSuccess', {
            imported: result.imported,
            updated: result.updated,
            skipped: result.skipped,
          })
        );
        void queryClient.invalidateQueries({ queryKey: queryKeys.goals.all });
        setIsImportModalVisible(false);
        setImportPreview(null);
        void navigate('/goals', { state: { imported: true } });
      } else {
        const errorSummary = result.errors.slice(0, 3).join('; ');
        message.warning(
          t('settings.importExport.importError', {
            errors: errorSummary + (result.errors.length > 3 ? '...' : ''),
          })
        );
        void queryClient.invalidateQueries({ queryKey: queryKeys.goals.all });
        setIsImportModalVisible(false);
        setImportPreview(null);
        void navigate('/goals', { state: { imported: true } });
      }
    } catch {
      message.error(t('settings.importExport.importFailed'));
    } finally {
      setIsImporting(false);
    }
  }, [importPreview, selectedStrategy, t, navigate, queryClient]);

  /**
   * Handle import modal cancel
   */
  const handleImportCancel = useCallback(() => {
    setIsImportModalVisible(false);
    setImportPreview(null);
    setSelectedStrategy('latest-wins');
  }, []);

  /**
   * Handle click on import button - triggers hidden file input
   */
  const handleImportButtonClick = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        await handleFileSelect(file);
        setIsImportModalVisible(true);
      }
    };
    input.click();
  }, [handleFileSelect]);

  return (
    <>
      <Card>
        <Title level={4}>{t('settings.importExport.title')}</Title>
        <Text type="secondary">{t('settings.importExport.description')}</Text>

        <Divider />

        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Title level={5}>{t('settings.importExport.exportTitle')}</Title>
            <Text>{t('settings.importExport.exportDescription')}</Text>
            <div style={{ marginTop: 16 }}>
              <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport}>
                {t('settings.importExport.exportButton')}
              </Button>
            </div>
          </div>

          <Divider style={{ margin: '12px 0' }} />

          <div>
            <Title level={5}>{t('settings.importExport.importTitle')}</Title>
            <Text>{t('settings.importExport.importDescription')}</Text>
            <div style={{ marginTop: 16 }}>
              <Button icon={<UploadOutlined />} onClick={handleImportButtonClick}>
                {t('settings.importExport.importButton')}
              </Button>
            </div>
          </div>
        </Space>
      </Card>

      {/* Import Modal */}
      <Modal
        title={t('settings.importExport.modalTitle')}
        open={isImportModalVisible}
        onCancel={handleImportCancel}
        footer={[
          <Button key="cancel" onClick={handleImportCancel}>
            {t('settings.importExport.cancel')}
          </Button>,
          <Button
            key="import"
            type="primary"
            loading={isImporting}
            disabled={!importPreview}
            onClick={handleImportConfirm}
          >
            {t('settings.importExport.import')}{' '}
            {importPreview
              ? `(${importPreview.newGoals} ${t('settings.importExport.newGoals')}, ${importPreview.duplicates} ${t('settings.importExport.duplicates')})`
              : ''}
          </Button>,
        ]}
        width={600}
      >
        {!importPreview ? (
          <>
            <Alert
              message={t('settings.importExport.selectFile')}
              description={t('settings.importExport.selectFileDescription')}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Button icon={<UploadOutlined />} onClick={handleImportButtonClick} size="large">
                {t('settings.importExport.clickToSelect')}
              </Button>
              <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                {t('settings.importExport.onlyJsonAccepted')}
              </Text>
            </div>
          </>
        ) : (
          <>
            <Alert
              message={t('settings.importExport.previewTitle')}
              description={
                <span>
                  {importPreview.newGoals} <strong>{t('settings.importExport.newGoals')}</strong>{' '}
                  {t('common.and').toLowerCase()} {importPreview.duplicates}{' '}
                  <strong>{t('settings.importExport.duplicates')}</strong>.
                </span>
              }
              type="success"
              showIcon
              style={{ marginBottom: 16 }}
            />

            {importPreview.duplicates > 0 && (
              <>
                <Alert
                  message={t('settings.importExport.duplicateHandling')}
                  description={
                    selectedStrategy === 'latest-wins'
                      ? t('settings.importExport.latestWinsDescription')
                      : selectedStrategy === 'skip'
                        ? t('settings.importExport.skipDescription')
                        : t('settings.importExport.replaceDescription')
                  }
                  type="info"
                  showIcon
                  icon={<WarningOutlined />}
                  style={{ marginBottom: 16 }}
                />

                <Space>
                  <Text>{t('settings.importExport.duplicateStrategy')}</Text>
                  <Button
                    size="small"
                    type={selectedStrategy === 'latest-wins' ? 'primary' : 'default'}
                    onClick={() => setSelectedStrategy('latest-wins')}
                  >
                    {t('settings.importExport.latestWins')}
                  </Button>
                  <Button
                    size="small"
                    type={selectedStrategy === 'skip' ? 'primary' : 'default'}
                    onClick={() => setSelectedStrategy('skip')}
                  >
                    {t('settings.importExport.skip')}
                  </Button>
                  <Button
                    size="small"
                    type={selectedStrategy === 'replace' ? 'primary' : 'default'}
                    onClick={() => setSelectedStrategy('replace')}
                  >
                    {t('settings.importExport.replace')}
                  </Button>
                </Space>
              </>
            )}
          </>
        )}
      </Modal>
    </>
  );
};

export default ImportExportSettings;
