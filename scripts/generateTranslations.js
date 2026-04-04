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
 * Usage: node scripts/generateTranslations.js [--dry-run]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = path.join(__dirname, '../src/locales');
const LANGUAGES = ['de', 'en', 'es', 'fr', 'hi', 'ja', 'ko', 'pt-br', 'ru', 'zh'];

/**
 * Recursively flattens a nested object into dot-notation keys
 */
const flattenObject = (obj, prefix = '') => {
  const result = {};

  for (const key in obj) {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null) {
      Object.assign(result, flattenObject(value, newKey));
    } else {
      result[newKey] = value;
    }
  }

  return result;
};

/**
 * Recursively un-flattens dot-notation keys back to nested object
 */
const unflattenObject = (flat) => {
  const result = {};

  for (const key in flat) {
    const parts = key.split('.');
    let current = result;

    for (let i = 0; i < parts.length - 1; i++) {
      if (!(parts[i] in current)) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }

    current[parts[parts.length - 1]] = flat[key];
  }

  return result;
};

/**
 * Loads translation file
 */
const loadTranslation = (lang) => {
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
const saveTranslation = (lang, data) => {
  const filePath = path.join(LOCALES_DIR, lang, 'translation.json');
  const content = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, content, 'utf-8');
};

/**
 * Compares two translation objects and finds missing keys
 */
const findMissingKeys = (source, target) => {
  return Object.keys(source).filter((key) => !(key in target));
};

/**
 * Main function
 */
const main = () => {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  console.log('🔄 Automatic Translation Generator');
  console.log('====================================\n');

  // Load all translations
  const translations = {};
  const flatTranslations = {};

  for (const lang of LANGUAGES) {
    translations[lang] = loadTranslation(lang);
    flatTranslations[lang] = flattenObject(translations[lang]);
    console.log(`📁 Loaded ${lang}: ${Object.keys(flatTranslations[lang]).length} keys`);
  }

  console.log('\n📊 Analyzing translations...\n');

  const englishKeys = flatTranslations['en'];
  const results = {};

  // Check each language against English
  for (const lang of LANGUAGES) {
    if (lang === 'en') continue;

    const missingKeys = findMissingKeys(englishKeys, flatTranslations[lang]);
    results[lang] = {
      added: 0,
      missing: missingKeys,
    };

    if (missingKeys.length > 0) {
      console.log(`⚠️  ${lang}: ${missingKeys.length} missing keys`);

      if (!dryRun) {
        // Add missing keys from English
        for (const key of missingKeys) {
          flatTranslations[lang][key] = `[TODO: translate] ${englishKeys[key]}`;
          results[lang].added++;
        }
      }
    } else {
      console.log(`✅ ${lang}: All keys present`);
    }
  }

  if (!dryRun) {
    console.log('\n💾 Saving translations...\n');

    for (const lang of LANGUAGES) {
      if (lang === 'en') continue;

      if (results[lang].added > 0) {
        const unflattened = unflattenObject(flatTranslations[lang]);
        saveTranslation(lang, unflattened);
        console.log(`   Saved ${lang}: ${results[lang].added} keys added`);
      }
    }

    console.log('\n✅ Translation generation complete!');
    console.log('   Please review and translate the [TODO] placeholder keys.\n');
  } else {
    console.log('\n🔍 Dry run - no files were modified.');
    console.log('   Run without --dry-run to apply changes.\n');
  }

  // Summary
  const totalMissing = Object.values(results).reduce((sum, r) => sum + r.missing.length, 0);
  console.log(`📈 Summary: ${totalMissing} missing keys across ${LANGUAGES.length - 1} languages`);
};

main();
