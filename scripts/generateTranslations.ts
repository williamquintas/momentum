#!/usr/bin/env node

/**
 * Automatic Translation Generator
 *
 * Generates missing translation keys across all language files by:
 * 1. Reading all translation files
 * 2. Finding missing keys in each language
 * 3. Auto-filling with English source (as fallback)
 * 4. Marking placeholders for manual review
 *
 * Usage: node scripts/generateTranslations.ts [--dry-run]
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
const flattenObject = (obj: TranslationData, prefix = ''): Record<string, string> => {
  const result: Record<string, string> = {};

  for (const key in obj) {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value as TranslationData, newKey));
    } else if (typeof value === 'string') {
      result[newKey] = value;
    }
  }

  return result;
};

/**
 * Recursively un-flattens dot-notation keys back to nested object
 */
const unflattenObject = (flat: Record<string, string>): TranslationData => {
  const result: TranslationData = {};

  for (const key in flat) {
    const parts = key.split('.');
    let current = result;

    for (let i = 0; i < parts.length - 1; i++) {
      if (!(parts[i] in current)) {
        current[parts[i]] = {};
      }
      current = current[parts[i]] as TranslationData;
    }

    current[parts[parts.length - 1]] = flat[key];
  }

  return result;
};

/**
 * Loads translation file
 */
const loadTranslation = (lang: string): TranslationData => {
  const filePath = path.join(LOCALES_DIR, lang, 'translation.json');

  if (!fs.existsSync(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
};

/**
 * Saves translation file
 */
const saveTranslation = (lang: string, data: TranslationData): void => {
  const filePath = path.join(LOCALES_DIR, lang, 'translation.json');
  const content = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, content, 'utf-8');
};

/**
 * Compares two translation objects and finds missing keys
 */
const findMissingKeys = (source: Record<string, string>, target: Record<string, string>): string[] => {
  return Object.keys(source).filter((key) => !(key in target));
};

/**
 * Main function
 */
const main = () => {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  console.log('Translation Generator');
  console.log('====================================\n');

  // Load all translations
  const translations: Record<string, TranslationData> = {};
  const flatTranslations: Record<string, Record<string, string>> = {};

  for (const lang of LANGUAGES) {
    translations[lang] = loadTranslation(lang);
    flatTranslations[lang] = flattenObject(translations[lang]);
    console.log(`Loaded ${lang}: ${Object.keys(flatTranslations[lang]).length} keys`);
  }

  console.log('\nAnalyzing translations...\n');

  const englishKeys = flatTranslations['en'];
  const results: Record<string, { added: number; missing: string[] }> = {};

  // Check each language against English
  for (const lang of LANGUAGES) {
    if (lang === 'en') continue;

    const missingKeys = findMissingKeys(englishKeys, flatTranslations[lang]);
    results[lang] = {
      added: 0,
      missing: missingKeys,
    };

    if (missingKeys.length > 0) {
      console.log(`${lang}: ${missingKeys.length} missing keys`);

      if (!dryRun) {
        // Add missing keys from English
        for (const key of missingKeys) {
          flatTranslations[lang][key] = `[TODO: translate] ${englishKeys[key]}`;
          results[lang].added++;
        }
      }
    } else {
      console.log(`${lang}: All keys present`);
    }
  }

  if (!dryRun) {
    console.log('\nSaving translations...\n');

    for (const lang of LANGUAGES) {
      if (lang === 'en') continue;

      if (results[lang].added > 0) {
        const unflattened = unflattenObject(flatTranslations[lang]);
        saveTranslation(lang, unflattened);
        console.log(`   Saved ${lang}: ${results[lang].added} keys added`);
      }
    }

    console.log('\nTranslation generation complete!');
    console.log('   Please review and translate the [TODO] placeholder keys.\n');
  } else {
    console.log('\nDry run - no files were modified.');
    console.log('   Run without --dry-run to apply changes.\n');
  }

  // Summary
  const totalMissing = Object.values(results).reduce((sum, r) => sum + r.missing.length, 0);
  console.log(`Summary: ${totalMissing} missing keys across ${LANGUAGES.length - 1} languages`);
};

main();
