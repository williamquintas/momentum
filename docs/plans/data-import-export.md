---
plan name: data-import-export
plan description: Add data import/export JSON
plan status: done
---

## Idea

Implement Issue #50 - Data Import/Export (JSON) feature with export service, import service with Zod validation, Settings page UI components, duplicate handling, and comprehensive tests.

## Implementation

- 1. Create JSON export service with schema versioning
- 2. Create JSON import service with Zod validation
- 3. Implement duplicate handling (latest-wins strategy)
- 4. Create Settings page UI components (ImportExportSettings)
- 5. Add duplicate detection UI in import modal
- 6. Write unit tests for export/import services (80%+ coverage)
- 7. Integrate with Ant Design Upload and Modal components
- 8. Run validation (npm run validate && npm test)
- 9. Code review and final adjustments

## Required Specs

<!-- SPECS_START -->

- import-export
<!-- SPECS_END -->
