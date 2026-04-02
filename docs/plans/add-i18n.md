---
plan name: add-i18n
plan description: Add i18n internationalization support
plan status: active
---

## Idea

Implement internationalization for the Momentum app using i18next and react-i18next with English, Spanish, and Brazilian Portuguese translations, language switcher, date/number localization, and automatic translation generation with CI validation.

## Implementation

- 1. Install i18next and react-i18next dependencies
- 2. Create i18n.ts configuration file with language detection
- 3. Create translation files for en, es, pt-br in src/locales/{lang}/translation.json
- 4. Create LanguageSwitcher component in header/settings
- 5. Implement date/time/number localization utilities
- 6. Integrate i18next with Ant Design
- 7. Add language detection (browser preference + localStorage)
- 8. Write tests with 80%+ coverage
- 9. Create automatic translation generator script
- 10. Add CI validation script for missing translations

## Required Specs

<!-- SPECS_START -->
<!-- SPECS_END -->
