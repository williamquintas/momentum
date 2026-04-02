/**
 * Data Import Service Tests
 *
 * Tests for importing goals from JSON format with Zod validation.
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

// Import after setting up mocks
import {
  parseImportJson,
  validateImportData,
  importGoals,
  previewImport,
  ImportValidationError,
} from '../dataImportService';

vi.mock('../goalStorageService', () => ({
  getAllGoals: vi.fn(),
  createGoal: vi.fn(),
  updateGoal: vi.fn(),
}));

import { getAllGoals, createGoal, updateGoal } from '../goalStorageService';

describe('Data Import Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('parseImportJson', () => {
    it('should parse valid JSON', () => {
      const json = '{"version": "1.0", "goals": []}';
      const result = parseImportJson(json);

      expect(result.version).toBe('1.0');
      expect(result.goals).toEqual([]);
    });

    it('should throw ImportValidationError for invalid JSON', () => {
      const json = 'not valid json';

      expect(() => parseImportJson(json)).toThrow(ImportValidationError);
    });
  });

  describe('validateImportData', () => {
    it('should validate correct import data', () => {
      const validData = {
        version: '1.0',
        exportedAt: '2024-01-01T00:00:00.000Z',
        appVersion: '0.1.0',
        goals: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            title: 'Test Goal',
            type: 'quantitative' as const,
            status: 'active' as const,
            priority: 'high' as const,
            category: 'test',
            tags: ['tag1'],
            progress: 50,
            progressHistory: [
              {
                id: '123e4567-e89b-12d3-a456-426614174001',
                date: '2024-01-01T00:00:00.000Z',
                value: 50,
              },
            ],
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
            notes: [
              {
                id: '123e4567-e89b-12d3-a456-426614174002',
                content: 'Test note',
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z',
                createdBy: 'user1',
              },
            ],
            attachments: [],
            relatedGoals: [],
            startValue: 0,
            targetValue: 100,
            currentValue: 50,
            unit: '%',
            allowDecimals: true,
          },
        ],
      };

      const result = validateImportData(validData);

      expect(result.version).toBe('1.0');
      expect(result.goals).toHaveLength(1);
      expect(result.goals[0]?.title).toBe('Test Goal');
    });

    it('should throw ImportValidationError for invalid data', () => {
      const invalidData = {
        version: '1.0',
        goals: [
          {
            // Missing required fields
            title: 'Test',
          },
        ],
      };

      expect(() => validateImportData(invalidData)).toThrow(ImportValidationError);
    });
  });

  describe('importGoals', () => {
    it('should import new goals', () => {
      const mockValidatedData = {
        version: '1.0',
        exportedAt: '2024-01-01T00:00:00.000Z',
        goals: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            title: 'New Goal',
            type: 'quantitative' as const,
            status: 'active' as const,
            priority: 'high' as const,
            category: 'test',
            tags: ['tag1'],
            progress: 50,
            progressHistory: [],
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
            notes: [],
            attachments: [],
            relatedGoals: [],
          },
        ],
      };

      vi.mocked(getAllGoals).mockReturnValue([]);

      const result = importGoals(mockValidatedData);

      expect(result.success).toBe(true);
      expect(result.imported).toBe(1);
      expect(result.updated).toBe(0);
      expect(result.skipped).toBe(0);
      expect(createGoal).toHaveBeenCalled();
    });

    it('should skip duplicate goals with older timestamps', () => {
      const mockValidatedData = {
        version: '1.0',
        exportedAt: '2024-01-01T00:00:00.000Z',
        goals: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            title: 'Existing Goal',
            type: 'quantitative' as const,
            status: 'active' as const,
            priority: 'high' as const,
            category: 'test',
            tags: ['tag1'],
            progress: 50,
            progressHistory: [],
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z', // Older
            notes: [],
            attachments: [],
            relatedGoals: [],
          },
        ],
      };

      const existingGoals = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Existing Goal',
          type: 'quantitative' as const,
          status: 'active' as const,
          priority: 'high' as const,
          category: 'test',
          tags: ['tag1'],
          progress: 50,
          progressHistory: [],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-02'), // Newer
          notes: [],
          attachments: [],
          relatedGoals: [],
        },
      ];

      vi.mocked(getAllGoals).mockReturnValue(existingGoals as never);

      const result = importGoals(mockValidatedData);

      expect(result.success).toBe(true);
      expect(result.imported).toBe(0);
      expect(result.skipped).toBe(1);
    });

    it('should update duplicate goals with newer timestamps (latest-wins)', () => {
      const mockValidatedData = {
        version: '1.0',
        exportedAt: '2024-01-01T00:00:00.000Z',
        goals: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            title: 'Existing Goal',
            type: 'quantitative' as const,
            status: 'active' as const,
            priority: 'high' as const,
            category: 'test',
            tags: ['tag1'],
            progress: 50,
            progressHistory: [],
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-03T00:00:00.000Z', // Newer
            notes: [],
            attachments: [],
            relatedGoals: [],
          },
        ],
      };

      const existingGoals = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Existing Goal',
          type: 'quantitative' as const,
          status: 'active' as const,
          priority: 'high' as const,
          category: 'test',
          tags: ['tag1'],
          progress: 50,
          progressHistory: [],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-02'), // Older
          notes: [],
          attachments: [],
          relatedGoals: [],
        },
      ];

      vi.mocked(getAllGoals).mockReturnValue(existingGoals as never);

      const result = importGoals(mockValidatedData);

      expect(result.success).toBe(true);
      expect(result.imported).toBe(0);
      expect(result.updated).toBe(1);
      expect(updateGoal).toHaveBeenCalled();
    });

    it('should handle skip strategy for duplicates', () => {
      const mockValidatedData = {
        version: '1.0',
        exportedAt: '2024-01-01T00:00:00.000Z',
        goals: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            title: 'Duplicate Goal',
            type: 'quantitative' as const,
            status: 'active' as const,
            priority: 'high' as const,
            category: 'test',
            tags: ['tag1'],
            progress: 50,
            progressHistory: [],
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-03T00:00:00.000Z',
            notes: [],
            attachments: [],
            relatedGoals: [],
          },
        ],
      };

      const existingGoals = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Duplicate Goal',
          type: 'quantitative' as const,
          status: 'active' as const,
          priority: 'high' as const,
          category: 'test',
          tags: ['tag1'],
          progress: 50,
          progressHistory: [],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-02'),
          notes: [],
          attachments: [],
          relatedGoals: [],
        },
      ];

      vi.mocked(getAllGoals).mockReturnValue(existingGoals as never);

      const result = importGoals(mockValidatedData, 'skip');

      expect(result.success).toBe(true);
      expect(result.imported).toBe(0);
      expect(result.skipped).toBe(1);
    });
  });

  describe('previewImport', () => {
    it('should count new goals and duplicates', () => {
      const mockValidatedData = {
        version: '1.0',
        exportedAt: '2024-01-01T00:00:00.000Z',
        goals: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            title: 'New Goal',
            type: 'quantitative' as const,
            status: 'active' as const,
            priority: 'high' as const,
            category: 'test',
            tags: ['tag1'],
            progress: 50,
            progressHistory: [],
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
            notes: [],
            attachments: [],
            relatedGoals: [],
          },
          {
            id: '223e4567-e89b-12d3-a456-426614174000',
            title: 'Existing Goal',
            type: 'quantitative' as const,
            status: 'active' as const,
            priority: 'high' as const,
            category: 'test',
            tags: ['tag1'],
            progress: 50,
            progressHistory: [],
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
            notes: [],
            attachments: [],
            relatedGoals: [],
          },
        ],
      };

      const existingGoals = [
        {
          id: '223e4567-e89b-12d3-a456-426614174000',
          title: 'Existing Goal',
          type: 'quantitative' as const,
          status: 'active' as const,
          priority: 'high' as const,
          category: 'test',
          tags: ['tag1'],
          progress: 50,
          progressHistory: [],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          notes: [],
          attachments: [],
          relatedGoals: [],
        },
      ];

      vi.mocked(getAllGoals).mockReturnValue(existingGoals as never);

      const result = previewImport(mockValidatedData);

      expect(result.newGoals).toBe(1);
      expect(result.duplicates).toBe(1);
    });
  });
});
