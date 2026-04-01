/**
 * Release Notes Parser
 *
 * Utility for parsing GitHub release notes into structured format.
 */

import type { ReleaseParseResult } from '../types';

/**
 * Parses a GitHub release body into structured categories
 */
export const parseReleaseNotes = (body: string, version: string): ReleaseParseResult => {
  const categories: Array<{ type: string; changes: string[] }> = [];
  const lines = body.split('\n');
  let currentCategory = '';
  let currentChanges: string[] = [];
  let isMajor = false;

  // Parse the release body
  for (const line of lines) {
    const trimmedLine = line.trim();

    // Check for category headers (e.g., "## Features", "### Bug Fixes")
    const featureMatch = trimmedLine.match(/^#{1,3}\s*(?:Features?|New Features?)\s*$/i);
    const fixMatch = trimmedLine.match(/^#{1,3}\s*(?:Bug\s*Fix(?:es)?)\s*$/i);
    const perfMatch = trimmedLine.match(/^#{1,3}\s*(?:Performance|Perf)\s*$/i);
    const breakingMatch = trimmedLine.match(/^#{1,3}\s*(?:Breaking\s*Changes?)\s*$/i);
    const docsMatch = trimmedLine.match(/^#{1,3}\s*(?:Documentation|Docs)\s*$/i);

    // Save previous category
    if (
      currentCategory &&
      (featureMatch || fixMatch || perfMatch || breakingMatch || docsMatch || trimmedLine.startsWith('## '))
    ) {
      if (currentChanges.length > 0) {
        categories.push({ type: currentCategory, changes: currentChanges });
      }
      currentChanges = [];
    }

    // Identify new category
    if (featureMatch) {
      currentCategory = 'feat';
    } else if (fixMatch) {
      currentCategory = 'fix';
    } else if (perfMatch) {
      currentCategory = 'perf';
    } else if (breakingMatch) {
      currentCategory = 'breaking';
      isMajor = true;
    } else if (docsMatch) {
      currentCategory = 'docs';
    } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      // Add change to current category
      const change = trimmedLine.substring(2).trim();
      if (change && currentCategory) {
        currentChanges.push(change);
      }
    }
  }

  // Push last category
  if (currentCategory && currentChanges.length > 0) {
    categories.push({ type: currentCategory, changes: currentChanges });
  }

  // If no categories found, treat whole body as general changes
  if (categories.length === 0 && body.trim()) {
    const allChanges = body
      .split('\n')
      .filter((line) => line.trim().startsWith('- ') || line.trim().startsWith('* '))
      .map((line) => line.trim().substring(2).trim());

    if (allChanges.length > 0) {
      categories.push({ type: 'chore', changes: allChanges });
    }
  }

  // Determine if it's a major version
  const majorMatch = version.match(/^v?(\d+)\.\d+\.\d+/);
  if (majorMatch && majorMatch[1]) {
    const major = parseInt(majorMatch[1], 10);
    isMajor = isMajor || major > 0;
  }

  return {
    version,
    date: new Date().toISOString(),
    categories,
    isMajor,
  };
};

/**
 * Extracts version from tag name
 */
export const extractVersion = (tagName: string): string => {
  return tagName.startsWith('v') ? tagName : `v${tagName}`;
};

/**
 * Formats a date string for display
 */
export const formatReleaseDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  }
  if (diffDays === 1) {
    return 'Yesterday';
  }
  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Determines release type from version string
 *
 * Semantic versioning interpretation:
 * - major: major version >= 2 (e.g., v2.0.0)
 * - minor: major version == 1 and minor > 0 (e.g., v1.2.0)
 * - patch: major version == 1 and minor == 0 (e.g., v1.0.1)
 */
export const getReleaseType = (version: string): 'major' | 'minor' | 'patch' => {
  const match = version.match(/^v?(\d+)\.(\d+)\.(\d+)/);
  if (!match || !match[1] || !match[2]) return 'patch';

  const majorNum = parseInt(match[1], 10);
  const minorNum = parseInt(match[2], 10);

  if (majorNum >= 2) return 'major';
  if (majorNum === 1 && minorNum > 0) return 'minor';
  return 'patch';
};

/**
 * Checks if a version string is a pre-release (RC, beta, alpha)
 */
export const isPrerelease = (version: string): boolean => {
  return /-rc\.|rc-/.test(version) || /-beta\./.test(version) || /-alpha\./.test(version);
};
