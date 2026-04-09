---
plan name: commit-all-changes
plan description: Commit all project changes
plan status: active
---

## Idea

Commit all 53 modified files following conventional commit format with proper staging and validation

## Implementation

- Analyze changes and group by logical scope (docs, i18n, ui, pages, config)
- Stage and commit docs files (AGENTS.md, CHANGELOG.md, README.md, docs/)
- Stage and commit i18n/translation files (10 locale files)
- Stage and commit UI component changes (Header, GoalCard, GoalDetail, GoalForm, GoalList)
- Stage and commit page changes (GoalsPage, GoalDetailPage, NotificationsPage, SettingsPage)
- Stage and commit remaining changes (package.json, scripts, styles, tests)
- Verify all commits with git log

## Required Specs

<!-- SPECS_START -->
<!-- SPECS_END -->
