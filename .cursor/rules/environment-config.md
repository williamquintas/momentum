# Environment Configuration

## Environment Variables
- Use environment variables for configuration
- Never commit secrets to repository
- Use `.env` files for local development
- Use `.env.example` for documentation
- Validate environment variables at startup

## Environment Files
- `.env.local`: Local overrides (gitignored, highest priority)
- `.env.development`: Development defaults
- `.env.staging`: Staging configuration
- `.env.production`: Production configuration
- `.env.test`: Test environment configuration
- `.env.example`: Example file with documentation (committed to repo)

### File Loading Precedence
Environment files are loaded in the following order (later files override earlier ones):
1. `.env` (base defaults)
2. `.env.[mode]` (e.g., `.env.development`, `.env.production`)
3. `.env.local` (local overrides, always loaded except in test mode)
4. Platform-specific overrides (Vercel, Netlify, etc.)

**Note**: `.env.local` is typically gitignored and should never be committed. It takes precedence over all other `.env` files except platform-specific variables.

## Configuration Structure
- Group related configs
- Use descriptive names
- Document each variable
- Provide default values when safe
- Validate required variables

### Naming Conventions
- **Format**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **Grouping**: Use prefixes to group related variables:
  - `API_*`: API-related configuration
  - `FEATURE_*` or `ENABLE_*`: Feature flags
  - `SERVICE_*`: Third-party service configuration
  - `DB_*`: Database configuration (server-side only)
  - `AUTH_*`: Authentication configuration
- **Boolean Flags**: Use clear boolean naming:
  - `ENABLE_*`: Enable a feature (e.g., `ENABLE_ANALYTICS`)
  - `DISABLE_*`: Disable a feature (e.g., `DISABLE_CACHE`)
  - `USE_*`: Use a service/feature (e.g., `USE_MOCK_API`)
- **URLs**: Suffix with `_URL` (e.g., `API_URL`, `CDN_URL`)
- **Timeouts**: Suffix with `_TIMEOUT` (e.g., `API_TIMEOUT`)
- **IDs/Keys**: Suffix with `_ID`, `_KEY`, or `_SECRET` (e.g., `ANALYTICS_ID`, `API_KEY`)

## Build Tool Prefixes
Different build tools require different prefixes for environment variables:
- **Vite**: `VITE_*` prefix (e.g., `VITE_API_URL`)
- **Create React App**: `REACT_APP_*` prefix (e.g., `REACT_APP_API_URL`)
- **Next.js**: `NEXT_PUBLIC_*` prefix for client-side (e.g., `NEXT_PUBLIC_API_URL`)
- **Remix**: Custom prefix (typically `REMIX_*` or define your own)
- **Astro**: `PUBLIC_*` prefix for client-side (e.g., `PUBLIC_API_URL`)
- **SvelteKit**: `PUBLIC_*` prefix for client-side (e.g., `PUBLIC_API_URL`)
- **Nuxt.js**: `NUXT_PUBLIC_*` prefix for client-side (e.g., `NUXT_PUBLIC_API_URL`)
- **Custom**: Define your own prefix convention

Choose a consistent prefix based on your build tool and use it throughout the project.

### Client-Side vs Server-Side Variables
- **Client-Side Variables**: Must use the build tool's prefix (e.g., `VITE_*`, `REACT_APP_*`)
  - These are embedded in the JavaScript bundle
  - **Visible to anyone** who inspects the bundle
  - **Never expose secrets, API keys, or tokens** client-side
  - Use for: API URLs, feature flags, public configuration
- **Server-Side Variables**: No prefix required (if using server-side rendering)
  - Only accessible on the server
  - Can contain sensitive information
  - Use for: Database credentials, secret keys, internal services

## Common Environment Variables
- **API Configuration**:
  - `API_URL` (with appropriate prefix): API base URL
  - `API_TIMEOUT` (with appropriate prefix): Request timeout in milliseconds
- **Feature Flags**:
  - `ENABLE_FEATURE_X` (with appropriate prefix): Feature toggles (boolean)
- **Third-Party Services**:
  - `SENTRY_DSN` (with appropriate prefix): Error tracking service DSN
  - `ANALYTICS_ID` (with appropriate prefix): Analytics service identifier
- **Environment Info**:
  - `ENV` (with appropriate prefix): Environment name (development/staging/production)
  - `APP_VERSION` (with appropriate prefix): Application version string

## Configuration Management
- Load config at application startup
- Validate required variables
- Provide sensible defaults
- Type configuration values
- Document all variables

## Type-Safe Configuration
- Create TypeScript interface for config
- Validate config structure
- Provide type-safe access
- Use validation libraries for runtime safety

### Basic Examples

#### Vite Example
```typescript
interface AppConfig {
  apiUrl: string;
  apiTimeout: number;
  env: 'development' | 'staging' | 'production';
}

const config: AppConfig = {
  apiUrl: import.meta.env.VITE_API_URL,
  apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  env: import.meta.env.VITE_ENV || 'development',
};
```

#### Create React App Example
```typescript
interface AppConfig {
  apiUrl: string;
  apiTimeout: number;
  env: 'development' | 'staging' | 'production';
}

const config: AppConfig = {
  apiUrl: process.env.REACT_APP_API_URL || '',
  apiTimeout: Number(process.env.REACT_APP_API_TIMEOUT) || 30000,
  env: (process.env.REACT_APP_ENV || 'development') as AppConfig['env'],
};
```

#### Framework-Agnostic Helper
```typescript
interface AppConfig {
  apiUrl: string;
  apiTimeout: number;
  env: 'development' | 'staging' | 'production';
}

// Helper function to get env var (adapt based on your build tool)
function getEnvVar(key: string, defaultValue?: string): string {
  // For Vite: return import.meta.env[key];
  // For CRA: return process.env[key];
  // For Next.js: return process.env[key];
  const value = process.env[key] || import.meta?.env?.[key] || defaultValue;
  if (!value && !defaultValue) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || defaultValue!;
}

const config: AppConfig = {
  apiUrl: getEnvVar('API_URL'),
  apiTimeout: Number(getEnvVar('API_TIMEOUT', '30000')),
  env: (getEnvVar('ENV', 'development') as AppConfig['env']),
};
```

### Validation Library Examples

#### Zod Validation (Recommended)
```typescript
import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.string().url('Invalid API URL'),
  VITE_API_TIMEOUT: z.coerce.number().positive().default(30000),
  VITE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  VITE_ENABLE_ANALYTICS: z.coerce.boolean().default(false),
});

// Validate and parse
const env = envSchema.parse(import.meta.env);

// Type-safe config
const config = {
  apiUrl: env.VITE_API_URL,
  apiTimeout: env.VITE_API_TIMEOUT,
  env: env.VITE_ENV,
  enableAnalytics: env.VITE_ENABLE_ANALYTICS,
};
```

#### Envalid Validation
```typescript
import { cleanEnv, str, num, url, bool } from 'envalid';

const env = cleanEnv(import.meta.env, {
  VITE_API_URL: url({ desc: 'API base URL' }),
  VITE_API_TIMEOUT: num({ default: 30000, desc: 'API request timeout in ms' }),
  VITE_ENV: str({
    choices: ['development', 'staging', 'production'],
    default: 'development',
  }),
  VITE_ENABLE_ANALYTICS: bool({ default: false }),
});

// Type-safe config
const config = {
  apiUrl: env.VITE_API_URL,
  apiTimeout: env.VITE_API_TIMEOUT,
  env: env.VITE_ENV,
  enableAnalytics: env.VITE_ENABLE_ANALYTICS,
};
```

#### Custom Validation with Type Safety
```typescript
function validateEnv<T extends Record<string, (value: string) => any>>(
  schema: T
): { [K in keyof T]: ReturnType<T[K]> } {
  const result = {} as any;
  
  for (const [key, validator] of Object.entries(schema)) {
    const value = import.meta.env[key];
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    result[key] = validator(value);
  }
  
  return result;
}

const env = validateEnv({
  VITE_API_URL: (v) => {
    if (!v.startsWith('http')) throw new Error('Invalid URL');
    return v;
  },
  VITE_API_TIMEOUT: (v) => {
    const num = Number(v);
    if (isNaN(num)) throw new Error('Invalid timeout');
    return num;
  },
});
```

## Environment Detection
- Detect environment at runtime
- Use for conditional logic
- Enable/disable features by environment
- Adjust logging levels
- Configure API endpoints

## Secret Management

### Core Principles
- Never commit secrets to repository
- Use secret management service (if applicable)
- Rotate secrets regularly
- Use different secrets per environment
- Document secret requirements (without exposing values)

### Client-Side Security Warning
⚠️ **Critical**: Client-side environment variables are visible in the JavaScript bundle. Never expose:
- API keys or tokens
- Database credentials
- Private keys or secrets
- Authentication secrets
- Any sensitive information

### Server-Side Secrets
- Store secrets server-side only
- Use environment variables on server
- Use secret management services (AWS Secrets Manager, HashiCorp Vault, etc.)
- Rotate secrets on a schedule
- Monitor for exposed secrets

### Secret Management Services
- **AWS Secrets Manager**: For AWS deployments
- **HashiCorp Vault**: Enterprise secret management
- **Azure Key Vault**: For Azure deployments
- **Google Secret Manager**: For GCP deployments
- **Platform Secrets**: Vercel, Netlify built-in secret management

### Secret Rotation
- Rotate secrets regularly (quarterly or as needed)
- Document rotation process
- Test rotation in staging first
- Have rollback plan for failed rotations
- Notify team before rotation

## Configuration Validation

### Validation Libraries
Use validation libraries for robust environment variable validation:

- **Zod** (recommended): Schema-based validation with TypeScript support
  ```typescript
  import { z } from 'zod';
  
  const envSchema = z.object({
    VITE_API_URL: z.string().url(),
    VITE_API_TIMEOUT: z.coerce.number().positive().default(30000),
    VITE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  });
  
  const env = envSchema.parse(import.meta.env);
  ```

- **envalid**: Purpose-built for environment variable validation
  ```typescript
  import { cleanEnv, str, num, url } from 'envalid';
  
  const env = cleanEnv(import.meta.env, {
    VITE_API_URL: url(),
    VITE_API_TIMEOUT: num({ default: 30000 }),
    VITE_ENV: str({ choices: ['development', 'staging', 'production'], default: 'development' }),
  });
  ```

- **dotenv-safe**: Ensures all required variables are present
  ```typescript
  import dotenvSafe from 'dotenv-safe';
  
  dotenvSafe.config({
    allowEmptyValues: false,
    example: '.env.example',
  });
  ```

### Validation Best Practices
- Validate on application startup
- Fail fast on invalid config
- Provide clear error messages
- Check required variables
- Validate format and types
- Use schema validation for complex structures
- Validate URLs, numbers, and enums properly
- Provide helpful error messages with missing variable names

## Build-Time vs Runtime

### Build-Time Configuration
- **Build-Time**: Values baked into bundle at build time (e.g., Vite, Webpack, Create React App)
  - Environment variables are replaced during build
  - Values are embedded in the JavaScript bundle
  - Requires rebuild to change values
  - Use for: API URLs, feature flags, static configuration

### Runtime Configuration
- **Runtime**: Values loaded at runtime (e.g., API configuration endpoint)
  - Values fetched from external source after application loads
  - Can be changed without rebuilding
  - Useful for dynamic configuration
  - Use for: Feature flags that change frequently, A/B test configuration, dynamic API endpoints

### Runtime Configuration Example
```typescript
// Fetch configuration from API at runtime
async function loadRuntimeConfig() {
  const response = await fetch('/api/config');
  const config = await response.json();
  return config;
}

// Use in application
const runtimeConfig = await loadRuntimeConfig();
const apiUrl = runtimeConfig.apiUrl || import.meta.env.VITE_API_URL;
```

### Hybrid Approach
- Use build-time for static configuration
- Use runtime for dynamic configuration
- Fallback to build-time values if runtime fetch fails
- Cache runtime configuration appropriately

## Testing Environment Variables

### Test Configuration
- Create `.env.test` file for test-specific configuration
- Use test-specific values (e.g., mock API URLs, test database)
- Isolate test environment from development/production

### Mocking in Tests
```typescript
// jest.setupFilesAfterEnv or vitest setup
import { vi } from 'vitest';

// Mock environment variables
vi.stubEnv('VITE_API_URL', 'http://localhost:3000/api');
vi.stubEnv('VITE_ENV', 'test');

// Or use dotenv for test files
import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });
```

### Test Isolation
- Reset environment variables between tests if needed
- Use test-specific configuration files
- Don't rely on development environment variables in tests
- Mock external services instead of using real endpoints

## CI/CD Integration

### Setting Environment Variables
- **GitHub Actions**:
  ```yaml
  env:
    VITE_API_URL: ${{ secrets.API_URL }}
    VITE_ENV: production
  
  # Or in workflow file
  - name: Build
    env:
      VITE_API_URL: ${{ secrets.API_URL }}
    run: npm run build
  ```

- **GitLab CI**:
  ```yaml
  variables:
    VITE_API_URL: $API_URL
    VITE_ENV: production
  ```

- **Vercel/Netlify**: Set in platform dashboard under Environment Variables

### Secret Management in CI/CD
- Use platform secret management (GitHub Secrets, GitLab Variables)
- Never hardcode secrets in CI/CD files
- Use different secrets per environment
- Rotate secrets regularly
- Validate required variables in CI/CD pipeline

### Validation in CI/CD
```yaml
# Example: Validate env vars in CI
- name: Validate environment variables
  run: |
    node scripts/validate-env.js
```

## Hot Reloading & Development

### Development Server Behavior
- **Vite**: Requires restart to pick up `.env` file changes
- **Create React App**: Requires restart to pick up `.env` file changes
- **Next.js**: Requires restart for most env changes (some can be hot-reloaded)

### Watching Environment Files
- Most build tools don't watch `.env` files automatically
- Restart dev server after changing `.env` files
- Use `.env.local` for local overrides that don't need to be shared

### Development Tips
- Use `.env.local` for personal development settings
- Document required variables in `.env.example`
- Provide sensible defaults for development
- Use development-specific API endpoints

## Default Values Strategy

### When to Use Defaults
- **Safe Defaults**: Use for non-critical configuration
  - Development API URLs
  - Timeout values
  - Feature flags (default to disabled)
  - Logging levels

### When to Fail Fast
- **Required Variables**: Fail immediately if missing
  - Production API URLs
  - Authentication keys
  - Critical service endpoints
  - Database connections (server-side)

### Default Value Examples
```typescript
// Safe defaults
const config = {
  apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
};

// Fail fast for required
const apiUrl = import.meta.env.VITE_API_URL;
if (!apiUrl) {
  throw new Error('VITE_API_URL is required but not set');
}
```

## Multi-Environment Management

### Environment-Specific Configuration
- Use separate `.env` files for each environment
- Share common variables in base `.env` file
- Override environment-specific values in `.env.[mode]` files
- Use platform-specific overrides for deployment

### Managing Multiple Environments
- **Shared Variables**: Common across all environments
  - Feature flags structure
  - Service names
  - Configuration keys
- **Environment-Specific**: Different per environment
  - API URLs
  - Service endpoints
  - Feature flag values
  - Logging levels

### Tools for Environment Management
- Use environment variable management tools (if applicable)
- Document environment differences
- Keep `.env.example` synchronized with all environments
- Use scripts to validate environment configurations

## Migration & Deprecation

### Deprecating Environment Variables
- Document deprecated variables in `.env.example` with deprecation notice
- Provide migration path in comments
- Support both old and new variables during transition
- Remove old variables after migration period

### Example Deprecation
```bash
# .env.example
# DEPRECATED: Use VITE_API_URL instead
# OLD_API_URL=http://old-api.example.com
VITE_API_URL=http://api.example.com
```

### Migration Strategy
1. Add new variable alongside old one
2. Support both in code with deprecation warning
3. Update documentation
4. Remove old variable after grace period
5. Communicate changes to team

## Error Messages & Debugging

### Clear Error Messages
```typescript
function getRequiredEnv(key: string): string {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
      `Please set ${key} in your .env file or environment.\n` +
      `See .env.example for required variables.`
    );
  }
  return value;
}
```

### Debugging Tips
- Log loaded configuration in development (never in production)
- Validate configuration on startup
- Provide helpful error messages with variable names
- Include links to documentation in error messages
- Check file loading order if variables aren't loading

### Common Issues
- **Variable not loading**: Check prefix, file location, restart dev server
- **Wrong value**: Check file precedence, platform overrides
- **Type errors**: Validate types, use coercion functions
- **Missing in production**: Check platform environment variable settings

## Type Generation & Auto-Documentation

### Auto-Generating Types
```typescript
// scripts/generate-env-types.ts
import { writeFileSync } from 'fs';
import { parse } from 'dotenv';

// Parse .env.example to generate types
const envExample = parse(fs.readFileSync('.env.example', 'utf-8'));

// Generate TypeScript types
const typeDefinitions = Object.keys(envExample)
  .map(key => `  ${key}: string;`)
  .join('\n');

writeFileSync('src/types/env.d.ts', `
declare namespace NodeJS {
  interface ProcessEnv {
${typeDefinitions}
  }
}
`);
```

### Documentation Generation
- Keep `.env.example` as source of truth
- Generate documentation from `.env.example`
- Include descriptions and examples
- Document required vs optional variables
- Include default values in documentation

## Secret Scanning & Prevention

### Preventing Secret Commits
- Use pre-commit hooks to scan for secrets
- Tools: `git-secrets`, `truffleHog`, `gitleaks`
- Scan before commits
- Block commits containing secrets

### Pre-Commit Hook Example
```bash
#!/bin/sh
# .git/hooks/pre-commit
if git-secrets --scan; then
  echo "Secrets detected! Commit blocked."
  exit 1
fi
```

### If Secrets Are Committed
1. **Immediately**: Rotate the exposed secret
2. **Remove**: Remove from git history (if possible)
3. **Notify**: Notify team and affected services
4. **Audit**: Review git history for other exposed secrets
5. **Prevent**: Strengthen prevention measures

### Secret Detection Tools
- **git-secrets**: AWS tool for detecting secrets
- **truffleHog**: Scans git history for secrets
- **gitleaks**: Fast secret scanner
- **GitHub Secret Scanning**: Automatic scanning (if using GitHub)

## Best Practices
- Document all environment variables
- Use consistent naming convention
- Group related variables
- Validate early
- Provide defaults when safe
- Keep `.env.example` updated
- Review environment variables regularly
- Never commit secrets
- Use validation libraries
- Test environment variable handling
- Monitor for exposed secrets
- Rotate secrets regularly
- Use different secrets per environment

