# Dependencies

## Package Management

- Use npm consistently (or pnpm/yarn if team standardizes on it)
- Lock dependency versions (package-lock.json, yarn.lock, or pnpm-lock.yaml)
- Commit lock files to repository
- Use exact versions for critical dependencies
- Use caret (^) or tilde (~) for others
- Never mix package managers in the same project
- Use `.npmrc` for project-specific npm configuration
- Configure registry settings if using private packages

## Dependency Categories

- **Dependencies**: Required for production
- **DevDependencies**: Required for development only
- **PeerDependencies**: Required by consuming packages
- **OptionalDependencies**: Optional packages
- **BundledDependencies**: Packages bundled with the package

### Categorization Guidelines

- Place build tools, test frameworks, and linters in devDependencies
- Only include runtime-required packages in dependencies
- Use peerDependencies for libraries that should be provided by the consumer
- Avoid optionalDependencies unless absolutely necessary

## Adding Dependencies

### Pre-Addition Checklist

- Evaluate need before adding
- Check bundle size impact
- Review package maintenance (last update, issue resolution, community activity)
- Check license compatibility (only permissive licenses)
- Read documentation thoroughly
- Check for alternatives (lighter, more maintained options)
- Review security history (GitHub security advisories)
- Check TypeScript support (types package or built-in types)
- Verify browser compatibility requirements
- Test thoroughly in development environment

### Evaluation Criteria

- **Maintenance**: Active development, regular updates, responsive maintainers
- **Popularity**: GitHub stars, npm downloads, community size
- **Bundle Size**: Use bundlephobia.com or similar tools
- **Type Safety**: Native TypeScript or @types package available
- **Compatibility**: Works with current React/TypeScript versions
- **Documentation**: Quality and completeness of docs
- **Alternatives**: Consider if a lighter or better-maintained alternative exists

## Updating Dependencies

### Update Strategy

- Update regularly for security patches
- Test after updates (unit tests, integration tests, manual testing)
- Update one at a time when possible (easier to isolate issues)
- Read changelogs before updating
- Check for breaking changes in changelog
- Review migration guides for major version updates
- Update lock file after changes
- Test in feature branch before merging

### Update Workflow

1. Check current version: `npm list <package>`
2. Check latest version: `npm view <package> version`
3. Read changelog/release notes
4. Check for breaking changes
5. Update package.json version range
6. Run `npm install`
7. Run tests and verify functionality
8. Check bundle size impact
9. Commit with descriptive message

### Breaking Change Detection

- Review changelog for "BREAKING" or "Breaking Changes" sections
- Check migration guides for major version bumps
- Use TypeScript compiler to catch type-related breaking changes
- Run full test suite after updates
- Review deprecation warnings in console

## Security Audits

### Audit Process

- Run `npm audit` or `yarn audit` regularly (weekly or before releases)
- Fix high and critical vulnerabilities immediately
- Review moderate vulnerabilities within 1 week
- Use Dependabot or similar tools for automated updates
- Monitor security advisories (GitHub Security, npm advisories)
- Run `npm audit fix` for automatic patches (review changes)
- Use `npm audit fix --force` with caution (may introduce breaking changes)

### Vulnerability Response

1. **Critical/High**: Fix within 24 hours
2. **Moderate**: Fix within 1 week
3. **Low**: Fix in next dependency update cycle
4. Document security fixes in commit messages
5. Test thoroughly after security patches

### Automated Security

- Enable Dependabot in GitHub (or similar)
- Configure security update frequency
- Set up automated PR creation for security patches
- Review and merge security PRs promptly
- Run security audits in CI/CD pipeline

## Dependency Review

### Periodic Review (Quarterly)

- Review all dependencies for usage
- Remove unused dependencies
- Consolidate similar packages (avoid duplicates)
- Check for alternatives (lighter, better-maintained)
- Monitor bundle size trends
- Review transitive dependencies
- Check for deprecated packages
- Verify all dependencies are still maintained

### Unused Dependency Detection

- Use `depcheck` or `npm-check` to find unused dependencies
- Review imports across codebase
- Check for dynamic imports that might use dependencies
- Remove unused dependencies to reduce bundle size and security surface

### Consolidation Opportunities

- Multiple date libraries → Use one (e.g., date-fns or dayjs)
- Multiple HTTP clients → Standardize on one
- Multiple state management → Choose one approach
- Multiple UI libraries → Avoid mixing (stick with Ant Design)

## Critical Dependencies

### Production Dependencies

- **React**: Core framework (pin to stable LTS version)
- **TypeScript**: Type safety (keep within React compatibility range)
- **Ant Design (antd)**: UI components (primary UI library)
- **React Query (@tanstack/react-query)**: Server state management
- **Zustand or Redux Toolkit**: Client state management (choose one)
- **React Router**: Routing (v6+)
- **date-fns or dayjs**: Date manipulation (choose one)

### Version Compatibility Matrix

- React 18.x → TypeScript 4.9+
- React 18.x → React Router 6.x
- Ant Design 5.x → React 18.x compatible
- React Query v5 → React 18.x required

### Dependency Decision Log

- Document major dependency choices and rationale
- Record version upgrade decisions
- Note alternatives considered and why they were rejected

## Development Dependencies

### Core Development Tools

- **ESLint**: Linting (with React, TypeScript plugins)
- **Prettier**: Code formatting
- **TypeScript**: Type checking and compilation
- **@testing-library/react**: React component testing
- **@testing-library/jest-dom**: DOM matchers
- **Husky**: Git hooks management
- **lint-staged**: Run linters on staged files
- **Vite or Webpack**: Build tool (Vite preferred for faster dev)

### Additional Development Tools

- **@types/node**: Node.js type definitions
- **@types/react**: React type definitions
- **vitest or jest**: Test runner
- **@vitejs/plugin-react**: Vite React plugin (if using Vite)
- **eslint-config-prettier**: Disable ESLint rules conflicting with Prettier

## Version Pinning Strategy

### Pinning Rules

- **Pin exact versions** for critical deps (React, TypeScript, Ant Design)
- **Use caret (^)** for minor/patch updates (e.g., `^5.0.0` allows 5.x.x)
- **Use tilde (~)** for patch-only updates (e.g., `~5.0.0` allows 5.0.x)
- **Use ranges** for less critical dependencies
- Review and update regularly (monthly for non-critical, quarterly for critical)
- Test thoroughly after updates
- Document version requirements in README or docs

### Critical Dependencies (Exact Versions)

```json
{
  "react": "18.2.0",
  "react-dom": "18.2.0",
  "typescript": "5.3.3"
}
```

### Non-Critical Dependencies (Ranges)

```json
{
  "lodash": "^4.17.21",
  "date-fns": "^2.30.0"
}
```

### Version Update Policy

- **Major versions**: Manual review, read migration guide, test extensively
- **Minor versions**: Review changelog, run tests, update if stable
- **Patch versions**: Auto-update via Dependabot, verify tests pass

## License Compliance

- Review all dependency licenses
- Ensure license compatibility
- Document license requirements
- Use license checker tools
- Comply with license terms

## Bundle Size Management

### Monitoring

- Monitor bundle size with each build
- Use bundle analyzer (webpack-bundle-analyzer, rollup-plugin-visualizer)
- Set bundle size budgets in build configuration
- Track bundle size trends over time
- Alert on significant size increases

### Optimization Strategies

- **Code splitting**: Split large dependencies into separate chunks
- **Tree shaking**: Ensure build tool supports tree shaking
- **Lazy loading**: Use React.lazy() for route-based code splitting
- **Dynamic imports**: Import heavy dependencies only when needed
- **Alternatives**: Consider lighter alternatives for large packages
  - Use `date-fns` instead of `moment.js`
  - Use `lodash-es` with tree shaking instead of full `lodash`
  - Use `antd` components individually, not full library import

### Bundle Analysis Tools

- `webpack-bundle-analyzer` for Webpack projects
- `rollup-plugin-visualizer` for Rollup/Vite projects
- `source-map-explorer` for detailed analysis
- Chrome DevTools Coverage tab for runtime analysis

### Size Budgets

- Set maximum bundle size limits
- Fail builds if budget exceeded
- Monitor individual chunk sizes
- Track vendor bundle size separately

## Best Practices

### General Practices

- Keep dependencies up to date (security patches immediately, others regularly)
- Remove unused dependencies (use depcheck)
- Monitor security vulnerabilities (automated + manual)
- Review licenses (ensure compatibility)
- Test after updates (automated + manual)
- Document critical dependencies and version decisions
- Use lock files (commit to repository)
- Review dependency tree regularly (quarterly audit)

### CI/CD Integration

- Run `npm ci` in CI (clean install from lock file)
- Run security audits in CI pipeline
- Fail builds on critical vulnerabilities
- Run dependency checks in pre-commit hooks
- Generate dependency reports in CI

### Conflict Resolution

- Resolve peer dependency warnings
- Use `overrides` or `resolutions` for transitive dependency conflicts
- Document why overrides are necessary
- Test thoroughly after applying overrides
- Prefer updating conflicting packages over overrides when possible

### Documentation Requirements

- Document major dependency choices in ADRs (Architecture Decision Records)
- Maintain CHANGELOG for dependency updates
- Document known issues or workarounds
- Keep compatibility matrix updated
- Document migration steps for major updates

### Workspace/Monorepo Considerations

- Use workspace features for shared dependencies
- Hoist common dependencies to root
- Avoid duplicate dependencies across packages
- Use consistent versions across workspace packages
- Configure shared .npmrc for workspace

### Performance Considerations

- Measure impact of new dependencies on build time
- Monitor install time (especially in CI)
- Use dependency caching in CI/CD
- Consider impact on cold start times
- Profile bundle size impact before adding large dependencies
