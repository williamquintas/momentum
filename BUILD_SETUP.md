# Build Tools & Development Environment Setup

This document describes the build tools and development environment configuration for the Goals Tracking System.

## Overview

The project uses modern build tools and development practices:

- **Build Tool**: Vite 5.x
- **TypeScript**: 5.3.3
- **Testing**: Vitest with jsdom
- **Linting**: ESLint with TypeScript support
- **Formatting**: Prettier
- **Git Hooks**: Husky with lint-staged

## Configuration Files

### Build Configuration

- **`vite.config.ts`**: Vite build configuration with:
  - React plugin
  - Path aliases (@/components, @/features, etc.)
  - Code splitting for vendor, antd, query, state, and utils chunks
  - Source maps enabled
  - Optimized build output

- **`tsconfig.json`**: TypeScript configuration with:
  - Strict mode enabled
  - Path aliases matching Vite config
  - ES2020 target
  - React JSX support

- **`tsconfig.node.json`**: TypeScript config for Node.js files (vite.config.ts)

### Testing Configuration

- **`vitest.config.ts`**: Vitest configuration with:
  - jsdom environment for DOM testing
  - Global test utilities
  - Coverage reporting (v8 provider)
  - Path aliases matching Vite config

- **`src/__tests__/setup.ts`**: Test setup file with:
  - Testing Library Jest DOM matchers
  - Window.matchMedia mock for Ant Design components
  - Automatic cleanup after tests

### Code Quality

- **`.eslintrc.json`**: ESLint configuration with:
  - TypeScript ESLint rules
  - React and React Hooks rules
  - JSX accessibility rules
  - Import ordering and organization
  - Security rules

- **`.prettierrc`**: Prettier configuration with:
  - 120 character line width
  - 2 space indentation
  - Single quotes
  - Semicolons enabled
  - LF line endings

- **`.editorconfig`**: Editor configuration for consistent formatting across editors

### Git Hooks

- **`.husky/pre-commit`**: Runs lint-staged on staged files
- **`.husky/pre-push`**: Runs type-check and lint before push

### Environment

- **`.nvmrc`**: Node.js version (18.0.0)
- **`.vscode/settings.json`**: VS Code workspace settings
- **`.vscode/extensions.json`**: Recommended VS Code extensions

## Available Scripts

### Development

```bash
npm run dev          # Start development server
npm run preview      # Preview production build
```

### Building

```bash
npm run build        # Build for production (type-check + vite build)
```

### Code Quality

```bash
npm run lint         # Run ESLint
npm run lint:fix     # Run ESLint with auto-fix
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm run type-check   # TypeScript type checking
npm run validate     # Run all checks (type-check + lint + format:check)
```

### Testing

```bash
npm run test         # Run tests
npm run test:ui      # Run tests with UI
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

## Development Workflow

1. **Install dependencies**: `npm install`
2. **Start development server**: `npm run dev`
3. **Before committing**: Git hooks automatically run lint-staged
4. **Before pushing**: Git hooks run type-check and lint

## Path Aliases

The project uses path aliases for cleaner imports:

- `@/components` → `src/components`
- `@/features` → `src/features`
- `@/hooks` → `src/hooks`
- `@/services` → `src/services`
- `@/utils` → `src/utils`
- `@/types` → `src/types`
- `@/constants` → `src/constants`
- `@/store` → `src/store`
- `@/pages` → `src/pages`
- `@/layouts` → `src/layouts`
- `@/providers` → `src/providers`
- `@/assets` → `src/assets`

## Build Optimizations

The Vite build configuration includes:

- **Code Splitting**: Separate chunks for vendor libraries, Ant Design, React Query, state management, and utilities
- **Minification**: ESBuild for fast minification
- **Source Maps**: Enabled for debugging
- **CSS Code Splitting**: Separate CSS files for better caching
- **Optimized Dependencies**: Pre-bundled dependencies for faster dev server

## IDE Setup

### VS Code

The project includes VS Code workspace settings that:

- Enable format on save
- Configure ESLint auto-fix on save
- Set Prettier as default formatter
- Configure TypeScript to use workspace version

### Recommended Extensions

- ESLint
- Prettier
- TypeScript and JavaScript Language Features

## Node Version

The project requires Node.js >= 18.0.0. Use `.nvmrc` with nvm:

```bash
nvm use
```

## Troubleshooting

### Build Issues

- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`

### Type Errors

- Run `npm run type-check` to see all TypeScript errors
- Ensure all dependencies are installed

### Linting Issues

- Run `npm run lint:fix` to auto-fix many issues
- Check `.eslintrc.json` for rule configurations

### Formatting Issues

- Run `npm run format` to format all files
- Check `.prettierrc` for formatting rules

