/**
 * Data Export Service Tests
 *
 * Tests for exporting goals to JSON format.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Mock URL.createObjectURL and URL.revokeObjectURL
const createObjectURLMock = vi.fn(() => 'blob:http://localhost/mock-url');
const revokeObjectURLMock = vi.fn();
Object.defineProperty(global, 'URL', {
  value: {
    createObjectURL: createObjectURLMock,
    revokeObjectURL: revokeObjectURLMock,
  },
});

// Mock document.createElement, appendChild, removeChild, click
const mockLink = {
  href: '',
  download: '',
  click: vi.fn(),
  remove: vi.fn(),
};
const createElementMock = vi.fn(() => mockLink);
const appendChildMock = vi.fn();
const removeChildMock = vi.fn();
Object.defineProperty(global.document, 'createElement', { value: createElementMock });
Object.defineProperty(global.document.body, 'appendChild', { value: appendChildMock });
Object.defineProperty(global.document.body, 'removeChild', { value: removeChildMock });

// Now import after mocks are set up
import { exportGoals, downloadExport, EXPORT_SCHEMA_VERSION, APP_VERSION } from '../dataExportService';

vi.mock('../goalStorageService', () => ({
  getAllGoals: vi.fn(),
}));

import { getAllGoals } from '../goalStorageService';

describe('Data Export Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('exportGoals', () => {
    it('should export all goals to JSON', async () => {
      const mockGoals = [
        {
          id: '123',
          title: 'Test Goal',
          type: 'quantitative' as const,
          status: 'active' as const,
          priority: 'high' as const,
          category: 'test',
          tags: ['tag1'],
          progress: 50,
          progressHistory: [{ id: 'ph1', date: new Date('2024-01-01'), value: 50 }],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          notes: [],
          attachments: [],
          relatedGoals: [],
          startValue: 0,
          targetValue: 100,
          currentValue: 50,
          unit: '%',
          allowDecimals: true,
        },
      ];

      vi.mocked(getAllGoals).mockReturnValue(mockGoals as never);

      const result = exportGoals();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.version).toBe(EXPORT_SCHEMA_VERSION);
      expect(result.data?.goals).toHaveLength(1);
      expect(result.data?.goals[0]?.title).toBe('Test Goal');
    });

    it('should handle empty goals array', () => {
      vi.mocked(getAllGoals).mockReturnValue([]);

      const result = exportGoals();

      expect(result.success).toBe(true);
      expect(result.data?.goals).toHaveLength(0);
    });

    it('should handle errors gracefully', () => {
      vi.mocked(getAllGoals).mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = exportGoals();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('downloadExport', () => {
    it('should create download link and trigger download', () => {
      const exportData = {
        version: EXPORT_SCHEMA_VERSION,
        exportedAt: '2024-01-01T00:00:00.000Z',
        appVersion: APP_VERSION,
        goals: [],
      };

      downloadExport(exportData);

      expect(createObjectURLMock).toHaveBeenCalledWith(expect.any(Blob));
      expect(createElementMock).toHaveBeenCalledWith('a');
      expect(mockLink.download).toContain('momentum-backup-');
      expect(mockLink.click).toHaveBeenCalled();
      expect(revokeObjectURLMock).toHaveBeenCalled();
    });

    it('should generate correct filename with date', () => {
      const exportData = {
        version: EXPORT_SCHEMA_VERSION,
        exportedAt: '2024-01-01T00:00:00.000Z',
        appVersion: APP_VERSION,
        goals: [],
      };

      downloadExport(exportData);

      // The filename should contain today's date (or the date from exportedAt)
      expect(mockLink.download).toContain('momentum-backup-');
    });
  });

  describe('constants', () => {
    it('should have correct schema version', () => {
      expect(EXPORT_SCHEMA_VERSION).toBe('1.0');
    });

    it('should have correct app version', () => {
      expect(APP_VERSION).toBe('0.1.0');
    });
  });
});
