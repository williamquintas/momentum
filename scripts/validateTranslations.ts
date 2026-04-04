#!/usr/bin/env node

/**
 * Translation Validation Script
 *
 * Validates that all translation keys are present across all language files.
 * Returns exit code 1 if any missing translations are found.
 *
 * Usage: node scripts/validateTranslations.js
 * CI usage: npm run validate:translations
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = path.join(__dirname, '../src/locales');
const LANGUAGES = ['de', 'en', 'es', 'fr', 'hi', 'ja', 'ko', 'pt-br', 'ru', 'zh'] as const;

type FlatValue = string;
type TranslationValue = FlatValue | NestedTranslation;
interface NestedTranslation {
  [key: string]: TranslationValue;
}
type TranslationData = NestedTranslation;

/**
 * Recursively flattens a nested object into dot-notation keys
 */
const flattenObject = (obj: TranslationData): Record<string, string> => {
  const result: Record<string, string> = {};

  const flatten = (o: TranslationData, prefix = ''): void => {
    for (const key in o) {
      const value = o[key];
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        flatten(value as TranslationData, newKey);
      } else if (typeof value === 'string') {
        result[newKey] = value;
      }
    }
  };

  flatten(obj);
  return result;
};

/**
 * Loads translation file
 */
const loadTranslation = (lang: string): TranslationData => {
  const filePath = path.join(LOCALES_DIR, lang, 'translation.json');

  if (!fs.existsSync(filePath)) {
    console.error(`Translation file not found: ${filePath}`);
    return {};
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
};

/**
 * Main function
 */
const main = (): number => {
  console.log('Translation Validator');
  console.log('====================================\n');

  // Load all translations
  const flatTranslations: Record<string, Record<string, string>> = {};

  for (const lang of LANGUAGES) {
    flatTranslations[lang] = flattenObject(loadTranslation(lang));
    console.log(`Loaded ${lang}: ${Object.keys(flatTranslations[lang]).length} keys`);
  }

  console.log('\nValidating translations...\n');

  const englishKeys = Object.keys(flatTranslations['en']);
  let hasErrors = false;

  // Check each language against English
  for (const lang of LANGUAGES) {
    if (lang === 'en') continue;

    const targetKeys = Object.keys(flatTranslations[lang]);
    const missingKeys = englishKeys.filter((key) => !targetKeys.includes(key));

    if (missingKeys.length > 0) {
      console.error(`ERROR: ${lang} is missing ${missingKeys.length} keys:`);
      missingKeys.slice(0, 10).forEach((key) => {
        console.error(`  - ${key}`);
      });
      if (missingKeys.length > 10) {
        console.error(`  ... and ${missingKeys.length - 10} more`);
      }
      hasErrors = true;
    } else {
      console.log(`OK: ${lang} has all ${targetKeys.length} keys`);
    }
  }

  console.log('');

  if (hasErrors) {
    console.error('VALIDATION FAILED: Missing translations detected');
    console.error('Run "node scripts/generateTranslations.ts" to auto-generate missing keys');
    return 1;
  }

  console.log('VALIDATION PASSED: All translations are complete');
  return 0;
};

const exitCode = main();
process.exit(exitCode);
