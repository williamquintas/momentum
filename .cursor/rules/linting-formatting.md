# Linting & Formatting

## ESLint Configuration

### Core Setup

- Use `@typescript-eslint/parser` for TypeScript parsing
- Enable React and React Hooks plugins
- Configure strict rules for code quality
- Use recommended rule sets as base
- Customize rules for project needs
- Use flat config format (ESLint 9+) or legacy format based on version

### Required Plugins

- `@typescript-eslint/eslint-plugin`: TypeScript-specific rules
- `eslint-plugin-react`: React best practices
- `eslint-plugin-react-hooks`: React Hooks rules
- `eslint-plugin-import`: Import/export validation
- `eslint-plugin-jsx-a11y`: Accessibility rules
- `eslint-plugin-security`: Security vulnerability detection
- `eslint-config-prettier`: Disable ESLint rules that conflict with Prettier

### Configuration Example

```json
{
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    },
    "project": "./tsconfig.json"
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:security/recommended",
    "prettier"
  ],
  "plugins": ["@typescript-eslint", "react", "react-hooks", "jsx-a11y", "import", "security"],
  "settings": {
    "react": {
      "version": "detect"
    },
    "import/resolver": {
      "typescript": {
        "alwaysTryTypes": true
      }
    }
  }
}
```

## ESLint Rules

### TypeScript Rules

- **Strict type checking**: Enable `@typescript-eslint/strict-type-checked`
- **No `any`**: `@typescript-eslint/no-explicit-any: error`
- **No unused variables**: `@typescript-eslint/no-unused-vars: error`
- **Prefer interfaces**: `@typescript-eslint/consistent-type-definitions: ['error', 'interface']`
- **No non-null assertions**: `@typescript-eslint/no-non-null-assertion: warn`
- **Explicit return types**: `@typescript-eslint/explicit-function-return-type: off` (too strict for most projects)
- **Prefer const assertions**: `@typescript-eslint/prefer-as-const: error`

### React Rules

- **React in scope**: `react/react-in-jsx-scope: off` (not needed in React 17+)
- **Prop types**: `react/prop-types: off` (using TypeScript instead)
- **Display name**: `react/display-name: warn`
- **No dangerous JSX**: `react/no-danger: error`
- **No direct mutation**: `react/no-direct-mutation-state: error`

### React Hooks Rules

- **Rules of Hooks**: `react-hooks/rules-of-hooks: error` (required)
- **Exhaustive deps**: `react-hooks/exhaustive-deps: warn` (important for correctness)

### Import/Export Rules

- **No unused imports**: `import/no-unused-modules: warn`
- **Import order**: `import/order: ['error', { groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'] }]`
- **No absolute imports in parent**: `import/no-relative-parent-imports: off` (can be enabled if needed)
- **No default exports**: `import/no-default-export: off` (preference-based)

### Accessibility Rules

- **Alt text required**: `jsx-a11y/alt-text: error`
- **Clickable elements**: `jsx-a11y/click-events-have-key-events: warn`
- **Interactive elements**: `jsx-a11y/interactive-supports-focus: error`
- **Label associations**: `jsx-a11y/label-has-associated-control: error`
- **ARIA attributes**: `jsx-a11y/aria-props: error`

### Security Rules

- **No eval**: `security/detect-eval-with-expression: error`
- **No dangerous regex**: `security/detect-unsafe-regex: error`
- **No non-literal fs**: `security/detect-non-literal-fs-filename: warn`
- **No dangerous innerHTML**: `security/detect-dangerous-html-in-js: error`

### Code Quality Rules

- **No console**: `no-console: ['warn', { allow: ['warn', 'error'] }]`
- **No debugger**: `no-debugger: error`
- **No var**: `no-var: error`
- **Prefer const**: `prefer-const: error`
- **No unused variables**: `no-unused-vars: off` (use TypeScript version)
- **Consistent return**: `consistent-return: error`
- **Default case**: `default-case: warn`
- **No else return**: `no-else-return: warn`

### File-Specific Overrides

```json
{
  "overrides": [
    {
      "files": ["*.test.ts", "*.test.tsx", "*.spec.ts", "*.spec.tsx"],
      "env": {
        "jest": true
      },
      "rules": {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-non-null-assertion": "off"
      }
    },
    {
      "files": ["*.config.ts", "*.config.js", "vite.config.ts"],
      "rules": {
        "import/no-default-export": "off"
      }
    },
    {
      "files": ["**/*.stories.tsx"],
      "rules": {
        "import/no-default-export": "off"
      }
    }
  ]
}
```

## Prettier Configuration

### Integration with ESLint

- Use `eslint-config-prettier` to disable conflicting ESLint rules
- Run Prettier after ESLint in pre-commit hooks
- Use `eslint-plugin-prettier` only if you want Prettier to run as an ESLint rule (not recommended)

### Configuration File

```json
{
  "printWidth": 120,
  "tabWidth": 2,
  "useTabs": false,
  "semicolons": true,
  "singleQuote": true,
  "quoteProps": "as-needed",
  "jsxSingleQuote": false,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "embeddedLanguageFormatting": "auto"
}
```

### Prettier Settings Explained

- **Print Width**: 120 characters (matches project standard)
- **Tab Width**: 2 spaces (consistent with code standards)
- **Semicolons**: Always (explicit, reduces ambiguity)
- **Quotes**: Single quotes for JS/TS, double for JSX (JSX convention)
- **Trailing Commas**: ES5 compatible (works in older environments)
- **Bracket Spacing**: `true` (e.g., `{ foo: bar }` not `{foo: bar}`)
- **Arrow Parens**: Always (e.g., `(x) => x` not `x => x`)
- **End of Line**: LF (Unix-style, consistent across platforms)

### Ignore Patterns

Create `.prettierignore`:

```
node_modules
dist
build
coverage
*.min.js
*.min.css
package-lock.json
yarn.lock
pnpm-lock.yaml
.env
.env.local
```

## TypeScript Configuration

### Strict Settings

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### Path Aliases

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/hooks/*": ["src/hooks/*"],
      "@/utils/*": ["src/utils/*"],
      "@/types/*": ["src/types/*"]
    }
  }
}
```

## Editor Configuration

### EditorConfig

Create `.editorconfig`:

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
indent_style = space
indent_size = 2
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false

[*.{json,yml,yaml}]
indent_size = 2
```

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "eslint.validate": ["javascript", "javascriptreact", "typescript", "typescriptreact"],
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### Recommended VS Code Extensions

- ESLint (`dbaeumer.vscode-eslint`)
- Prettier (`esbenp.prettier-vscode`)
- EditorConfig (`editorconfig.editorconfig`)
- TypeScript (`vscode.typescript-language-features`)

## Pre-commit Hooks

### Husky Setup

```bash
# Install Husky
npm install --save-dev husky lint-staged

# Initialize Husky
npx husky init
```

### Husky Pre-commit Hook

Create `.husky/pre-commit`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

### lint-staged Configuration

Add to `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{js,jsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,yml,yaml}": ["prettier --write"]
  }
}
```

### Alternative: Separate Scripts

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["eslint --fix --max-warnings=0", "prettier --write --check"],
    "*.{json,md,yml,yaml,css,scss}": ["prettier --write"]
  }
}
```

## Package.json Scripts

### Recommended Scripts

```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "lint:fix": "eslint . --ext .ts,.tsx,.js,.jsx --fix",
    "lint:report": "eslint . --ext .ts,.tsx,.js,.jsx --format json --output-file eslint-report.json",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md,yml,yaml}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md,yml,yaml}\"",
    "type-check": "tsc --noEmit",
    "type-check:watch": "tsc --noEmit --watch",
    "validate": "npm run type-check && npm run lint && npm run format:check"
  }
}
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Lint and Format

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run format:check
```

### Linting Reports

- Generate JSON reports: `eslint --format json --output-file eslint-report.json`
- Use `eslint-formatter-*` packages for custom formats
- Integrate with code quality tools (SonarQube, CodeClimate)

## Import Organization

### Import Order Rules

```json
{
  "rules": {
    "import/order": [
      "error",
      {
        "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
        "pathGroups": [
          {
            "pattern": "react",
            "group": "external",
            "position": "before"
          },
          {
            "pattern": "react-dom",
            "group": "external",
            "position": "before"
          },
          {
            "pattern": "@/**",
            "group": "internal",
            "position": "after"
          }
        ],
        "pathGroupsExcludedImportTypes": ["react"],
        "newlines-between": "always",
        "alphabetize": {
          "order": "asc",
          "caseInsensitive": true
        }
      }
    ],
    "import/no-duplicates": "error",
    "import/no-unused-modules": "warn"
  }
}
```

### Import Organization Pattern

```typescript
// 1. React and React-related
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. External libraries
import { Card, Button } from 'antd';
import dayjs from 'dayjs';

// 3. Internal absolute imports
import { useGoals } from '@/hooks/useGoals';
import { GoalCard } from '@/components/GoalCard';

// 4. Relative imports
import { calculateProgress } from './utils';
import type { Goal } from './types';
```

## Rule Severity Levels

### Error (Must Fix)

- Type safety violations
- Security vulnerabilities
- React Hooks violations
- Unused variables/imports
- Syntax errors

### Warning (Should Fix)

- Code quality issues
- Best practice violations
- Potential bugs
- Accessibility concerns (non-critical)

### Off (Disable)

- Rules that conflict with project patterns
- Rules that are too strict for the project
- Legacy code compatibility (temporary)

### Disabling Rules

```typescript
// Disable for entire file
/* eslint-disable @typescript-eslint/no-explicit-any */

// Disable for next line
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = fetchData();

// Disable for specific rule in block
/* eslint-disable @typescript-eslint/no-explicit-any */
const block = () => {
  // code here
};
/* eslint-enable @typescript-eslint/no-explicit-any */
```

## Auto-fix Strategies

### Auto-fixable Rules

- Formatting (Prettier handles)
- Import organization
- Unused imports/variables
- Semicolons
- Quotes
- Trailing commas

### Manual Fix Required

- Type errors
- Logic errors
- Security issues
- Complex refactoring

### Running Auto-fix

```bash
# Fix all auto-fixable issues
npm run lint:fix

# Fix specific file
npx eslint --fix path/to/file.ts

# Fix with Prettier
npm run format
```

## Performance Optimization

### ESLint Caching

```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx --cache --cache-location .eslintcache"
  }
}
```

### Parallel Execution

- Use `eslint --max-warnings` to limit output
- Use `--quiet` to show only errors
- Use `--cache` for faster subsequent runs

### Ignore Patterns

Create `.eslintignore`:

```
node_modules
dist
build
coverage
*.min.js
*.config.js
public
```

## Troubleshooting

### Common Issues

#### ESLint and Prettier Conflicts

- Ensure `eslint-config-prettier` is last in extends array
- Don't use `eslint-plugin-prettier` (not recommended)

#### TypeScript Parser Errors

- Ensure `tsconfig.json` includes all files being linted
- Check `parserOptions.project` path is correct
- Use `parserOptions.tsconfigRootDir` if needed

#### Import Resolution Errors

- Configure `import/resolver` in ESLint settings
- Install `eslint-import-resolver-typescript`
- Check path aliases match `tsconfig.json`

#### Slow Linting

- Enable ESLint caching
- Use `--max-warnings` to limit output
- Consider using `eslint_d` for faster runs
- Exclude large directories in `.eslintignore`

### Migration Strategy

#### Adding Linting to Existing Codebase

1. Start with minimal rules (recommended sets only)
2. Gradually enable stricter rules
3. Use `--max-warnings` to allow gradual migration
4. Fix issues incrementally by file or feature
5. Document any temporarily disabled rules

#### Example Migration Script

```json
{
  "scripts": {
    "lint:loose": "eslint . --ext .ts,.tsx --max-warnings=1000",
    "lint:strict": "eslint . --ext .ts,.tsx --max-warnings=0"
  }
}
```

## Custom Rules

### When to Create Custom Rules

- Project-specific patterns
- Team conventions not covered by standard rules
- Legacy code migration needs
- Domain-specific requirements

### Documenting Custom Rules

- Add comments explaining why rule exists
- Include examples of correct/incorrect usage
- Review periodically for relevance
- Remove when no longer needed

### Example Custom Rule Decision

```json
{
  "rules": {
    // Allow default exports in page components only
    "import/no-default-export": [
      "error",
      {
        "except": ["pages/**"]
      }
    ]
  }
}
```

## Configuration Files

### File Locations

- `.eslintrc.js` or `.eslintrc.json`: ESLint configuration (root)
- `.prettierrc` or `.prettierrc.json`: Prettier configuration (root)
- `tsconfig.json`: TypeScript configuration (root)
- `.editorconfig`: Editor configuration (root)
- `.husky/`: Git hooks directory (root)
- `.eslintignore`: ESLint ignore patterns (root)
- `.prettierignore`: Prettier ignore patterns (root)
- `.vscode/settings.json`: VS Code workspace settings

### Configuration Priority

1. Inline comments (highest priority)
2. File-specific overrides
3. Project root configuration
4. Extends configurations (lowest priority)

## Tools

### Core Tools

- **ESLint**: JavaScript/TypeScript linting (`eslint`)
- **Prettier**: Code formatting (`prettier`)
- **TypeScript**: Type checking (`tsc`)
- **Husky**: Git hooks (`husky`)
- **lint-staged**: Run linters on staged files (`lint-staged`)

### Recommended Plugins

- `@typescript-eslint/eslint-plugin`: TypeScript rules
- `eslint-plugin-react`: React rules
- `eslint-plugin-react-hooks`: React Hooks rules
- `eslint-plugin-import`: Import/export validation
- `eslint-plugin-jsx-a11y`: Accessibility rules
- `eslint-plugin-security`: Security rules
- `eslint-config-prettier`: Disable conflicting rules
- `eslint-import-resolver-typescript`: TypeScript import resolution

### Optional Tools

- `eslint_d`: Faster ESLint daemon
- `prettier-eslint`: Format with ESLint integration (not recommended)
- `eslint-formatter-*`: Custom report formats
