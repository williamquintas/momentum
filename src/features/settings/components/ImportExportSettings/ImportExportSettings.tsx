/**
 * Import Export Settings Component
 *
 * UI for exporting and importing goals data in JSON format.
 * Uses Ant Design components for consistent styling.
 */

import { useState, useCallback } from 'react';

import { DownloadOutlined, UploadOutlined, WarningOutlined } from '@ant-design/icons';
import { Button, Modal, message, Card, Alert, Space, Typography, Divider } from 'antd';
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
      message.success(`Successfully exported ${result.data.goals.length} goals`);
    } else {
      message.error(result.error || 'Failed to export goals');
    }
  }, []);

  /**
   * Handle file selection for import
   */
  const handleFileSelect = useCallback(async (file: File): Promise<void> => {
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
        message.error(`Validation failed: ${errorMessages}`);
      } else {
        message.error('Failed to parse import file. Please ensure it is valid JSON.');
      }
      setImportPreview(null);
    }
  }, []);

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
          `Import complete: ${result.imported} new goals, ${result.updated} updated, ${result.skipped} skipped`
        );
      } else {
        const errorSummary = result.errors.slice(0, 3).join('; ');
        message.warning(`Import completed with errors: ${errorSummary}${result.errors.length > 3 ? '...' : ''}`);
      }

      setIsImportModalVisible(false);
      setImportPreview(null);
    } catch {
      message.error('Import failed. Please try again.');
    } finally {
      setIsImporting(false);
    }
  }, [importPreview, selectedStrategy]);

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
        <Title level={4}>Data Import/Export</Title>
        <Text type="secondary">
          Export your goals to a JSON file for backup, or import goals from a previously exported file.
        </Text>

        <Divider />

        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {/* Export Section */}
          <div>
            <Title level={5}>Export Goals</Title>
            <Text>Download all your goals as a JSON file for backup or transfer to another device.</Text>
            <div style={{ marginTop: 16 }}>
              <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport}>
                Export to JSON
              </Button>
            </div>
          </div>

          <Divider style={{ margin: '12px 0' }} />

          {/* Import Section */}
          <div>
            <Title level={5}>Import Goals</Title>
            <Text>Import goals from a previously exported JSON file. Duplicates are handled automatically.</Text>
            <div style={{ marginTop: 16 }}>
              <Button icon={<UploadOutlined />} onClick={handleImportButtonClick}>
                Import from JSON
              </Button>
            </div>
          </div>
        </Space>
      </Card>

      {/* Import Modal */}
      <Modal
        title="Import Goals"
        open={isImportModalVisible}
        onCancel={handleImportCancel}
        footer={[
          <Button key="cancel" onClick={handleImportCancel}>
            Cancel
          </Button>,
          <Button
            key="import"
            type="primary"
            loading={isImporting}
            disabled={!importPreview}
            onClick={handleImportConfirm}
          >
            Import {importPreview ? `(${importPreview.newGoals} new, ${importPreview.duplicates} duplicates)` : ''}
          </Button>,
        ]}
        width={600}
      >
        {!importPreview ? (
          <>
            <Alert
              message="Select a JSON file to import"
              description="The file should be a valid JSON export from Momentum. Goals with the same ID or title+type will be treated as duplicates."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Button icon={<UploadOutlined />} onClick={handleImportButtonClick} size="large">
                Click to select JSON file
              </Button>
              <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                Only .json files are accepted
              </Text>
            </div>
          </>
        ) : (
          <>
            <Alert
              message="Import Preview"
              description={
                <span>
                  Found <strong>{importPreview.newGoals}</strong> new goals and{' '}
                  <strong>{importPreview.duplicates}</strong> duplicates.
                </span>
              }
              type="success"
              showIcon
              style={{ marginBottom: 16 }}
            />

            {importPreview.duplicates > 0 && (
              <>
                <Alert
                  message="Duplicate Handling"
                  description={
                    selectedStrategy === 'latest-wins'
                      ? 'Goals with the same ID or title+type will be compared by their update timestamp. The most recent version will be kept.'
                      : selectedStrategy === 'skip'
                        ? 'Duplicate goals will be skipped entirely.'
                        : 'Duplicate goals will be replaced with the imported version.'
                  }
                  type="info"
                  showIcon
                  icon={<WarningOutlined />}
                  style={{ marginBottom: 16 }}
                />

                <Space>
                  <Text>Duplicate strategy:</Text>
                  <Button
                    size="small"
                    type={selectedStrategy === 'latest-wins' ? 'primary' : 'default'}
                    onClick={() => setSelectedStrategy('latest-wins')}
                  >
                    Latest Wins
                  </Button>
                  <Button
                    size="small"
                    type={selectedStrategy === 'skip' ? 'primary' : 'default'}
                    onClick={() => setSelectedStrategy('skip')}
                  >
                    Skip
                  </Button>
                  <Button
                    size="small"
                    type={selectedStrategy === 'replace' ? 'primary' : 'default'}
                    onClick={() => setSelectedStrategy('replace')}
                  >
                    Replace
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
