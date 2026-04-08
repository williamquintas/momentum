# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.2] - 2026-04-07

### Fixed

- Translation key conflict between button and modal - use separate `updateProgressBtn` key for button

## [0.2.1] - 2026-04-07

### Fixed

- Date utilities with improved deadline calculations
- View mode handling of null/undefined states

## [0.2.0] - 2026-04-06

### Added

- Full internationalization (i18n) support with 10 languages (English, Portuguese-BR, Spanish, French, German, Russian, Japanese, Korean, Chinese, Hindi)
- In-app release notifications with changelog modal and "What's New" feature
- Data import/export functionality for backup and restore
- PWA support with install prompt, offline indicator, and auto-update
- Theme settings component for light/dark mode customization
- Notifications page for viewing release updates
- Notification bell component for new release alerts

### Changed

- Refactored Header component into layout-based structure
- Updated i18n configuration and localization files
- Enhanced theme context with persistence support

### Fixed

- Fixed APP_VERSION in dataExportService to use package.json version
- Improved duplicate detection for progress updates

### Testing

- Added tests for release notification system
- Added tests for GitHub API integration
- Added tests for notification storage
- Added tests for release notes parser

---

## [0.1.0] - 2026-03-27

### Added

- Multiple goal types support (Quantitative, Qualitative, Binary, Milestone, Recurring, Habit)
- Goal creation and management functionality
- Progress tracking and visualization
- Dashboard overview
- Goal list view with filtering and search
- Goal type tooltips in goal creation form to help users understand each goal type
- Runtime feature flags to disable goal types and features (milestone, recurring, habit, attachments, notes)
- Feature flags controlled via environment variables (VITE*ENABLE*\*)
- **Goal Features**: Favorites, archiving, and related goals display
- **Goal Completion**: Complete goal dialog with celebration animations (confetti), manual and automatic completion detection
- **Progress Tracking**: Duplicate detection for progress updates, milestone dependency validation, over-achievement support for quantitative goals
- **Filtering & Search**: Filter by status, type, priority, category; search functionality
- **View Goal Details**: Enhanced goal detail page with full information display
- **Goal Status Management**: Status management capabilities
- Responsive design for mobile, tablet, and desktop
- Accessibility features
- Local storage persistence
- TypeScript type definitions
- Comprehensive test coverage
- GitHub Actions CI/CD workflow
- Development documentation

### Changed

- Updated progress calculation to support over-achievement
- Enhanced validation for milestone dependencies

### Fixed

- Milestone goal creation now submits correctly
- Recurring and Habit goal types can now be created
- Form resets after successful goal creation
- Habit progress updates handle date objects correctly
- Progress update duplicate detection now handles undefined history gracefully

### Testing

- Unit tests for calculateProgress and progressHistory
- Integration tests for update workflow
- Component tests for UpdateProgressModal
- Fixed HabitGoalFields tests to match actual component behavior
- Test coverage with @vitest/coverage-v8

### Dependencies

- Added @vitest/coverage-v8 for test coverage

### Security

- Initial security configuration
- Environment variable validation

---

## Types of Changes

- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** for vulnerability fixes
