# Build Tools & Development Environment Setup

This document describes the build tools and development environment configuration for Momentum.

## Overview

The project uses modern build tools and development practices:

- **Build Tool**: Vite 6.x
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

- **`.nvmrc`**: Node.js version (24.0.0)
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

The project requires Node.js >= 24.0.0. Use `.nvmrc` with nvm:

```bash
nvm use
```

## Environment Variables

### Available Variables

The application uses environment variables for configuration. Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

### Common Environment Variables

| Variable            | Description                  | Default    |
| ------------------- | ---------------------------- | ---------- |
| `VITE_APP_TITLE`    | Application title            | `Momentum` |
| `VITE_API_URL`      | API base URL (if applicable) | Local      |
| `VITE_ENABLE_DEBUG` | Enable debug mode            | `false`    |

### Development vs Production

- **Development**: Uses Vite's dev server with hot module replacement
- **Production**: Built assets are optimized and minified

### Security Notes

- Never commit `.env.local` or `.env` files to version control
- The `.env.example` file should contain only safe, non-sensitive defaults
- Use `.gitignore` to exclude sensitive environment files

## Troubleshooting

### Build Issues

- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`
- Ensure Node.js version matches `.nvmrc` (run `nvm use`)

### Type Errors

- Run `npm run type-check` to see all TypeScript errors
- Ensure all dependencies are installed
- Check `tsconfig.json` for correct path configurations

### Linting Issues

- Run `npm run lint:fix` to auto-fix many issues
- Check `.eslintrc.json` for rule configurations
- Ensure TypeScript is properly configured

### Formatting Issues

- Run `npm run format` to format all files
- Check `.prettierrc` for formatting rules
- Ensure Prettier plugin is installed

### Port Already in Use

- If port 5173 is in use, Vite will automatically try the next available port
- To specify a different port: `npm run dev -- --port 3000`
- Find and kill the process using the port: `lsof -i :5173`

### Husky/Git Hooks Issues

- If pre-commit hooks fail, check `npm run prepare` has run successfully
- Reinstall Husky: `npx husky install`
- Skip hooks temporarily: `git commit --no-verify` (not recommended)

### Dependency Issues

- Clear npm cache: `npm cache clean --force`
- Delete `package-lock.json` and reinstall for a clean slate
- Check for conflicting peer dependencies

### Memory Issues

- If encountering out-of-memory errors during build, increase Node memory:
  ```bash
  NODE_OPTIONS=--max_old_space_size=4096 npm run build
  ```
