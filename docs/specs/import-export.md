# Spec: import-export

Scope: feature

# Data Import/Export Feature Specification

## Overview

Add JSON import/export functionality to allow users to backup and restore their goals data.

## Requirements

### Export Service

- Export all goals to JSON format
- Include schema version field for future compatibility
- Use browser File API for download (`URL.createObjectURL`)
- Include metadata: export timestamp, app version

### Import Service

- Parse JSON and validate against schema using Zod
- Handle duplicates with latest-wins strategy (compare `updatedAt` timestamps)
- Validate all goal fields before import
- Show detailed error messages for validation failures

### JSON Schema

```json
{
  "version": "1.0",
  "exportedAt": "ISO date string",
  "appVersion": "string",
  "goals": [ ... ]
}
```

### UI Components

- Settings page with Import/Export section
- Export button: downloads JSON file
- Import button: opens file picker
- Import modal with:
  - File upload area (Ant Design Upload)
  - Preview of goals to import (count)
  - Duplicate detection warning
  - Confirm/Cancel buttons

### Duplicate Handling

- Compare goals by ID or title+type combination
- If duplicate found, compare `updatedAt` timestamp
- Import the one with newer timestamp (latest-wins)
- Show summary: "X new goals, Y updated, Z skipped"

## Technical Details

- Use Zod for schema validation
- Reuse existing storage service (`goalStorageService.ts`)
- Use Ant Design: Upload, Modal, message, Button
- File API: `FileReader` for reading, `URL.createObjectURL` for download

## Acceptance Criteria

1. Export button downloads valid JSON file with all goals
2. Import accepts valid JSON and adds goals to storage
3. Invalid JSON shows error message
4. Duplicate goals handled by latest-wins strategy
5. UI shows import preview before confirming
6. 80%+ test coverage achieved
