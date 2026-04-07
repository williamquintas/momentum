# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2026-04-07

### Fixed

- Date utilities with improved deadline calculations
- View mode handling of null/undefined states

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
