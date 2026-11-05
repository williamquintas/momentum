import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GoalType, GoalStatus, Priority } from '@/types/goal.types';

import {
  importGoals,
  ImportValidationError,
  parseImportJson,
  previewImport,
  validateImportData,
  type ParsedImportData,
} from '../dataImportService';
import { exportGoals } from '../dataExportService';
import { createGoal, getAllGoals, getGoal, restoreGoals } from '../goalStorageService';
import { STORAGE_KEYS, StorageErrorType } from '../storageTypes';

const DATE = '2024-01-01T00:00:00.000Z';
const LATER = '2024-02-01T00:00:00.000Z';
const uuid = (value: number): string => `123e4567-e89b-42d3-a456-${String(value).padStart(12, '0')}`;
const entry = { id: uuid(90), date: DATE, completed: true, value: 1, note: 'Kept' };
const stats = {
  totalOccurrences: 2,
  completedOccurrences: 1,
  completionRate: 50,
  streak: { current: 1, longest: 1, lastCompletedDate: DATE, startDate: DATE },
  lastCompletedDate: DATE,
  firstCompletedDate: DATE,
};
const goalFixture = (type: GoalType = GoalType.QUANTITATIVE, index = 1): Record<string, unknown> => {
  const fields: Record<GoalType, Record<string, unknown>> = {
    quantitative: { startValue: 0, targetValue: 100, currentValue: 50, unit: 'km', allowDecimals: true },
    qualitative: {
      qualitativeStatus: 'in_progress',
      selfAssessments: [{ id: uuid(91), date: DATE, rating: 7, comment: 'Kept' }],
      targetRating: 8,
    },
    binary: { currentCount: 1, targetCount: 2, allowPartialCompletion: true, items: ['A', 'B'] },
    milestone: {
      milestones: [
        { id: uuid(92), title: 'First', order: 0, status: 'completed', completedDate: DATE },
        { id: uuid(93), title: 'Next', order: 1, status: 'pending', dueDate: LATER, dependencies: [uuid(92)] },
      ],
      allowMilestoneReordering: true,
      requireSequentialCompletion: true,
    },
    recurring: {
      recurrence: { frequency: 'daily', interval: 1, endDate: LATER },
      occurrences: [entry],
      completionStats: stats,
    },
    habit: { targetFrequency: 'daily', entries: [entry], completionStats: stats, habitStrength: 45 },
  };
  return {
    id: uuid(index),
    title: `Goal ${type} ${index}`,
    type,
    status: 'active',
    priority: 'high',
    category: 'Health',
    tags: ['beta'],
    progress: 50,
    progressHistory: [{ id: uuid(94), date: DATE, value: 50, note: 'Original progress' }],
    createdAt: DATE,
    updatedAt: DATE,
    startDate: DATE,
    deadline: LATER,
    archived: false,
    favorite: true,
    notes: [
      { id: uuid(95), content: 'Private note', createdAt: DATE, updatedAt: DATE, createdBy: 'local', tags: ['a'] },
    ],
    attachments: [
      {
        id: uuid(96),
        filename: 'reference.txt',
        url: 'blob:metadata-only',
        mimeType: 'text/plain',
        size: 1,
        uploadedAt: DATE,
        uploadedBy: 'local',
      },
    ],
    relatedGoals: [],
    ...fields[type],
  };
};
const backup = (goals: unknown[]): ParsedImportData => ({ version: '1.0', exportedAt: DATE, goals });
const validated = (goals: unknown[]): ReturnType<typeof validateImportData> => validateImportData(backup(goals));
const exportedGoals = (): unknown[] => {
  const exported = exportGoals();
  expect(exported.success).toBe(true);
  return (JSON.parse(JSON.stringify(exported.data)) as { goals: unknown[] }).goals;
};
const snapshotStorage = (): Record<string, string | null> =>
  Object.fromEntries(Object.values(STORAGE_KEYS).map((key) => [key, localStorage.getItem(key)]));

describe('Data Import Service with real goal storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('parses valid JSON and rejects malformed JSON', () => {
    expect(parseImportJson('{"version":"1.0","goals":[]}').goals).toEqual([]);
    expect(() => parseImportJson('not JSON')).toThrow(ImportValidationError);
  });
  it.each(Object.values(GoalType))('preserves %s through restore, reload and re-export', (type) => {
    const original = goalFixture(type);
    expect(importGoals(validated([original]))).toEqual({
      success: true,
      imported: 1,
      updated: 0,
      skipped: 0,
      errors: [],
    });
    expect(exportedGoals()).toEqual([original]);
    const restored = getGoal(uuid(1));
    expect(restored?.notes[0]?.createdAt).toBeInstanceOf(Date);
    expect(restored?.attachments[0]?.uploadedAt).toBeInstanceOf(Date);
    if (restored?.type === GoalType.QUALITATIVE) expect(restored.selfAssessments[0]?.date).toBeInstanceOf(Date);
    if (restored?.type === GoalType.RECURRING || restored?.type === GoalType.HABIT)
      expect(restored.completionStats.streak.startDate).toBeInstanceOf(Date);
    const actualBackup = parseImportJson(JSON.stringify(exportGoals().data));
    localStorage.clear();
    expect(importGoals(validateImportData(actualBackup)).success).toBe(true);
    expect(exportedGoals()).toEqual([original]);
  });
  it('restores six types together with cross-goal identities and indexes', () => {
    const goals = Object.values(GoalType).map((type, index) => ({
      ...goalFixture(type, index + 1),
      relatedGoals: [uuid(((index + 1) % 6) + 1)],
    }));
    expect(importGoals(validated(goals)).imported).toBe(6);
    expect(exportedGoals()).toEqual(goals);
    const tags = JSON.parse(localStorage.getItem(STORAGE_KEYS.GOALS_BY_TAG) ?? '{}') as Record<string, string[]>;
    expect(tags.beta).toHaveLength(6);
  });
  it.each([GoalType.HABIT, GoalType.RECURRING])(
    'keeps legacy %s without statistics readable and exportable',
    (type) => {
      const valid = goalFixture();
      importGoals(validated([valid]));
      const legacy = goalFixture(type, 2);
      delete legacy.completionStats;
      localStorage.setItem(STORAGE_KEYS.GOALS_DATA, JSON.stringify({ [uuid(1)]: valid, [uuid(2)]: legacy }));
      localStorage.setItem(STORAGE_KEYS.GOALS_INDEX, JSON.stringify({ ids: [uuid(1), uuid(2)], lastUpdated: DATE }));
      expect(getAllGoals()).toHaveLength(2);
      expect(exportedGoals()).toEqual([valid, legacy]);
      expect(getGoal(uuid(2))).not.toHaveProperty('completionStats');
    }
  );
  it('keeps normal creation defaults independent of restoration', () => {
    const created = createGoal({
      type: GoalType.QUANTITATIVE,
      title: 'New goal',
      status: GoalStatus.ACTIVE,
      priority: Priority.HIGH,
      category: 'Health',
      tags: [],
      relatedGoals: [],
      startValue: 0,
      targetValue: 100,
      currentValue: 0,
      unit: 'km',
      allowDecimals: true,
    });
    expect(created.progress).toBe(0);
    expect(created.notes).toEqual([]);
    expect(created.id).not.toBe(uuid(1));
    expect(getGoal(created.id)?.title).toBe('New goal');
  });
  it.each(['skip', 'latest-wins'] as const)('keeps older or equal duplicates with %s', (strategy) => {
    const original = { ...goalFixture(), updatedAt: LATER };
    importGoals(validated([original]));
    expect(importGoals(validated([{ ...goalFixture(), currentValue: 10 }]), strategy)).toEqual({
      success: true,
      imported: 0,
      updated: 0,
      skipped: 1,
      errors: [],
    });
    expect(exportedGoals()).toEqual([original]);
    expect(importGoals(validated([original]), strategy).skipped).toBe(1);
  });
  it('updates newer duplicates preserving backup timestamps and notes', () => {
    importGoals(validated([goalFixture()]));
    const newer = { ...goalFixture(), updatedAt: LATER, currentValue: 75, progress: 75 };
    expect(importGoals(validated([newer])).updated).toBe(1);
    expect(exportedGoals()).toEqual([newer]);
  });
  it('explicit replace restores an older version', () => {
    importGoals(validated([{ ...goalFixture(), updatedAt: LATER }]));
    const older = { ...goalFixture(), progress: 25, currentValue: 25 };
    expect(importGoals(validated([older]), 'replace').updated).toBe(1);
    expect(exportedGoals()).toEqual([older]);
  });
  it('remaps relations when title and type match an existing identity', () => {
    const existing = goalFixture();
    importGoals(validated([existing]));
    const duplicate = { ...existing, id: uuid(2), updatedAt: LATER };
    const related = { ...goalFixture(GoalType.BINARY, 3), relatedGoals: [uuid(2)] };
    expect(importGoals(validated([duplicate, related]), 'replace')).toMatchObject({ imported: 1, updated: 1 });
    expect(getGoal(uuid(3))?.relatedGoals).toEqual([uuid(1)]);
    expect(getGoal(uuid(2))).toBeNull();
  });
  it('deduplicates within a file and across repeated imports', () => {
    const older = goalFixture();
    const newer = { ...older, updatedAt: LATER, currentValue: 75 };
    const data = validated([older, newer]);
    expect(previewImport(data)).toEqual({ newGoals: 1, duplicates: 1 });
    expect(importGoals(data).imported).toBe(1);
    expect(exportedGoals()).toEqual([newer]);
    expect(importGoals(data).skipped).toBe(2);
    expect(getAllGoals()).toHaveLength(1);
  });
  it('previews existing and new goals without modifying goal storage', () => {
    importGoals(validated([goalFixture()]));
    const before = snapshotStorage();
    expect(previewImport(validated([goalFixture(), goalFixture(GoalType.BINARY, 2)]))).toEqual({
      newGoals: 1,
      duplicates: 1,
    });
    expect(snapshotStorage()).toEqual(before);
  });
  it.each(Object.values(GoalType))('rejects incomplete %s goals before writing', (type) => {
    const goal = goalFixture(type);
    const fields: Record<GoalType, string> = {
      quantitative: 'targetValue',
      qualitative: 'selfAssessments',
      binary: 'currentCount',
      milestone: 'milestones',
      recurring: 'completionStats',
      habit: 'completionStats',
    };
    delete goal[fields[type]];
    expect(() => validated([goal])).toThrow(ImportValidationError);
    expect(localStorage).toHaveLength(0);
  });
  it('rejects unknown versions, malformed dates and missing required data', () => {
    expect(() => validateImportData({ ...backup([]), version: '2.0' })).toThrow(ImportValidationError);
    expect(() => validated([{ ...goalFixture(), createdAt: 'invalid' }])).toThrow(ImportValidationError);
    expect(() => validated([{ title: 'Missing data' }])).toThrow(ImportValidationError);
    expect(localStorage).toHaveLength(0);
  });
  it('preserves allowed overachievement and rejects it otherwise', () => {
    const over = { ...goalFixture(), allowOverAchievement: true, progress: 125, currentValue: 125 };
    expect(importGoals(validated([over])).success).toBe(true);
    expect(exportedGoals()).toEqual([over]);
    expect(() => validated([{ ...over, allowOverAchievement: false }])).toThrow(ImportValidationError);
  });
  it('rejects dangling references without partially importing valid goals', () => {
    importGoals(validated([goalFixture()]));
    const before = snapshotStorage();
    const result = importGoals(
      validated([goalFixture(GoalType.BINARY, 2), { ...goalFixture(GoalType.HABIT, 3), relatedGoals: [uuid(999)] }])
    );
    expect(result).toMatchObject({ success: false, imported: 0, updated: 0 });
    expect(snapshotStorage()).toEqual(before);
  });
  it('rejects missing and cyclic milestone dependencies', () => {
    const goal = goalFixture(GoalType.MILESTONE);
    const first = { id: uuid(92), title: 'First', order: 0, status: 'pending', dependencies: [uuid(93)] };
    expect(() => validated([{ ...goal, milestones: [first] }])).toThrow(ImportValidationError);
    expect(() =>
      validated([
        {
          ...goal,
          milestones: [first, { id: uuid(93), title: 'Next', order: 1, status: 'pending', dependencies: [uuid(92)] }],
        },
      ])
    ).toThrow(ImportValidationError);
  });
  it.each([
    STORAGE_KEYS.GOALS_TRANSACTION,
    STORAGE_KEYS.GOALS_INDEX,
    STORAGE_KEYS.GOALS_DATA,
    STORAGE_KEYS.GOALS_BY_TYPE,
    STORAGE_KEYS.GOALS_BY_STATUS,
    STORAGE_KEYS.GOALS_BY_CATEGORY,
    STORAGE_KEYS.GOALS_BY_TAG,
  ])('rolls back the entire import after failure at %s', (failedKey) => {
    importGoals(validated([goalFixture()]));
    const before = snapshotStorage();
    const originalSet = localStorage.setItem.bind(localStorage);
    let hasFailed = false;
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key, value): void {
      if (key === failedKey && !hasFailed) {
        hasFailed = true;
        throw new DOMException('Injected failure', 'QuotaExceededError');
      }
      originalSet(key, value);
    });
    const result = importGoals(validated([{ ...goalFixture(), updatedAt: LATER }, goalFixture(GoalType.BINARY, 2)]));
    expect(hasFailed).toBe(true);
    expect(result).toMatchObject({ success: false, imported: 0, updated: 0 });
    expect(snapshotStorage()).toEqual(before);
    expect(getAllGoals()).toHaveLength(1);
  });
  it('retains the journal on failed rollback and recovers before the next read', () => {
    importGoals(validated([goalFixture()]));
    const before = snapshotStorage();
    const originalSet = localStorage.setItem.bind(localStorage);
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key, value): void {
      if (key === STORAGE_KEYS.GOALS_DATA) throw new DOMException('Persistent failure', 'QuotaExceededError');
      originalSet(key, value);
    });
    expect(importGoals(validated([goalFixture(GoalType.BINARY, 2)])).success).toBe(false);
    expect(localStorage.getItem(STORAGE_KEYS.GOALS_TRANSACTION)).not.toBeNull();
    expect(() => getAllGoals()).toThrow('could not be recovered');
    spy.mockRestore();
    expect(getAllGoals()).toHaveLength(1);
    expect(snapshotStorage()).toEqual(before);
  });
  it('does not recover an active restore when another reader arrives during a write', () => {
    importGoals(validated([goalFixture()]));
    const originalSet = localStorage.setItem.bind(localStorage);
    let readWasBlocked = false;
    let attemptedRead = false;
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key, value): void {
      originalSet(key, value);
      if (key === STORAGE_KEYS.GOALS_INDEX && !attemptedRead) {
        attemptedRead = true;
        try {
          getAllGoals();
        } catch {
          readWasBlocked = true;
        }
      }
    });
    expect(importGoals(validated([goalFixture(GoalType.BINARY, 2)])).success).toBe(true);
    expect(readWasBlocked).toBe(true);
    expect(getAllGoals()).toHaveLength(2);
  });
  it('waits for a crashed writer lease to expire before recovering its snapshot', () => {
    importGoals(validated([goalFixture()]));
    const before = snapshotStorage();
    const snapshot = [
      STORAGE_KEYS.GOALS_INDEX,
      STORAGE_KEYS.GOALS_DATA,
      STORAGE_KEYS.GOALS_BY_TYPE,
      STORAGE_KEYS.GOALS_BY_STATUS,
      STORAGE_KEYS.GOALS_BY_CATEGORY,
      STORAGE_KEYS.GOALS_BY_TAG,
    ].map((key) => ({ key, value: localStorage.getItem(key) }));
    const now = Date.now();
    localStorage.setItem(
      STORAGE_KEYS.GOALS_TRANSACTION,
      JSON.stringify({ owner: uuid(999), expiresAt: now + 60_000, snapshot })
    );
    localStorage.setItem(STORAGE_KEYS.GOALS_DATA, '{}');
    expect(() => getAllGoals()).toThrow('restore is in progress');
    vi.spyOn(Date, 'now').mockReturnValue(now + 60_001);
    expect(getAllGoals()).toHaveLength(1);
    expect(snapshotStorage()).toEqual(before);
  });
  it('retains quota error classification when restoring a batch', () => {
    importGoals(validated([goalFixture()]));
    const goal = getGoal(uuid(1));
    if (!goal) throw new Error('Fixture missing');
    const originalSet = localStorage.setItem.bind(localStorage);
    let hasFailed = false;
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key, value): void {
      if (key === STORAGE_KEYS.GOALS_DATA && !hasFailed) {
        hasFailed = true;
        throw new DOMException('Injected quota error', 'QuotaExceededError');
      }
      originalSet(key, value);
    });
    expect(() => restoreGoals([goal])).toThrow(expect.objectContaining({ type: StorageErrorType.QUOTA_EXCEEDED }));
    expect(getAllGoals()).toHaveLength(1);
  });
  it('does not create a restore journal for ordinary goal creation', () => {
    const writes: string[] = [];
    const originalSet = localStorage.setItem.bind(localStorage);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key, value): void {
      writes.push(key);
      originalSet(key, value);
    });
    createGoal({
      type: GoalType.QUANTITATIVE,
      title: 'Ordinary creation',
      status: GoalStatus.ACTIVE,
      priority: Priority.HIGH,
      category: 'Health',
      tags: [],
      relatedGoals: [],
      startValue: 0,
      targetValue: 100,
      currentValue: 0,
      unit: 'km',
      allowDecimals: true,
    });
    expect(writes).not.toContain(STORAGE_KEYS.GOALS_TRANSACTION);
  });
});
