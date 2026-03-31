/**
 * Release Notes Parser Tests
 */
import { describe, it, expect } from 'vitest';
import { parseReleaseNotes, extractVersion, formatReleaseDate, getReleaseType } from '../utils/parseReleaseNotes';

describe('parseReleaseNotes', () => {
  it('should parse release notes with features section', () => {
    const body = `## Features
- New feature 1
- New feature 2`;

    const result = parseReleaseNotes(body, 'v1.0.0');

    expect(result.version).toBe('v1.0.0');
    expect(result.categories).toContainEqual({
      type: 'feat',
      changes: ['New feature 1', 'New feature 2'],
    });
  });

  it('should parse release notes with bug fixes section', () => {
    const body = `## Bug Fixes
- Fix bug 1
- Fix bug 2`;

    const result = parseReleaseNotes(body, 'v1.0.0');

    expect(result.categories).toContainEqual({
      type: 'fix',
      changes: ['Fix bug 1', 'Fix bug 2'],
    });
  });

  it('should parse release notes with breaking changes', () => {
    const body = `## Breaking Changes
- Remove old API`;

    const result = parseReleaseNotes(body, 'v2.0.0');

    expect(result.isMajor).toBe(true);
    expect(result.categories).toContainEqual({
      type: 'breaking',
      changes: ['Remove old API'],
    });
  });

  it('should handle multiple categories', () => {
    const body = `## Features
- New feature

## Bug Fixes
- Fix bug

## Performance
- Performance improvement`;

    const result = parseReleaseNotes(body, 'v1.1.0');

    expect(result.categories.length).toBe(3);
    expect(result.categories).toContainEqual({
      type: 'feat',
      changes: ['New feature'],
    });
    expect(result.categories).toContainEqual({
      type: 'fix',
      changes: ['Fix bug'],
    });
    expect(result.categories).toContainEqual({
      type: 'perf',
      changes: ['Performance improvement'],
    });
  });

  it('should handle plain list items without headers', () => {
    const body = `- Change 1
- Change 2`;

    const result = parseReleaseNotes(body, 'v1.0.0');

    expect(result.categories).toContainEqual({
      type: 'chore',
      changes: ['Change 1', 'Change 2'],
    });
  });

  it('should handle empty body', () => {
    const result = parseReleaseNotes('', 'v1.0.0');

    expect(result.categories).toEqual([]);
  });
});

describe('extractVersion', () => {
  it('should add v prefix if not present', () => {
    expect(extractVersion('1.0.0')).toBe('v1.0.0');
  });

  it('should keep v prefix if already present', () => {
    expect(extractVersion('v1.0.0')).toBe('v1.0.0');
  });

  it('should handle version with pre-release', () => {
    expect(extractVersion('1.0.0-beta.1')).toBe('v1.0.0-beta.1');
  });
});

describe('formatReleaseDate', () => {
  it('should return "Today" for current date', () => {
    const today = new Date().toISOString();
    expect(formatReleaseDate(today)).toBe('Today');
  });

  it('should return "Yesterday" for previous day', () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    expect(formatReleaseDate(yesterday)).toBe('Yesterday');
  });

  it('should return days ago for dates within a week', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatReleaseDate(threeDaysAgo)).toBe('3 days ago');
  });

  it('should return formatted date for older dates', () => {
    const oldDate = new Date(2025, 0, 15).toISOString();
    const result = formatReleaseDate(oldDate);
    expect(result).toContain('Jan');
    expect(result).toContain('2025');
  });
});

describe('getReleaseType', () => {
  it('should return major for major version changes', () => {
    expect(getReleaseType('v2.0.0')).toBe('major');
    expect(getReleaseType('2.0.0')).toBe('major');
  });

  it('should return minor for minor version changes', () => {
    expect(getReleaseType('v1.2.0')).toBe('minor');
    expect(getReleaseType('1.2.0')).toBe('minor');
  });

  it('should return patch for patch version changes', () => {
    expect(getReleaseType('v1.0.1')).toBe('patch');
    expect(getReleaseType('1.0.1')).toBe('patch');
  });

  it('should return patch for invalid version strings', () => {
    expect(getReleaseType('invalid')).toBe('patch');
    expect(getReleaseType('')).toBe('patch');
  });
});
