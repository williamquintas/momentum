# GitHub Actions Workflows

This directory contains GitHub Actions workflows for CI/CD, version management, and automated releases.

## Workflows

### CI (`ci.yml`)

Runs on every push and pull request to `main` and `develop` branches.

**Jobs:**

- **lint-and-type-check**: Runs TypeScript type checking, ESLint, and Prettier format checking
- **test**: Runs test suite and uploads coverage reports
- **build**: Builds the application and uploads artifacts
- **security-audit**: Runs npm audit for security vulnerabilities
- **version-check**: Validates semantic versioning format and CHANGELOG consistency

### Release (`release.yml`)

Automated release workflow for version management and GitHub releases.

**Triggers:**

- Manual workflow dispatch (with version type selection)
- Push of tags starting with `v` (e.g., `v1.0.0`)

**Features:**

- Automatic version bumping (patch, minor, major)
- Changelog generation using `standard-version`
- Git tag creation
- GitHub release creation with release notes
- Build artifact upload

**Usage:**

1. Go to Actions → Release workflow
2. Click "Run workflow"
3. Select version bump type
4. Workflow handles the rest automatically

### Version Check (`version-check.yml`)

Validates version consistency and semantic versioning format.

**Triggers:**

- Pull requests to `main` or `develop`
- Pushes to `main` or `develop`

**Checks:**

- Semantic versioning format validation
- CHANGELOG.md version entry verification
- Git tag conflict detection

## Workflow Permissions

All workflows use the default `GITHUB_TOKEN` with the following permissions:

- **Contents**: Read and write (for releases and version bumps)
- **Pull Requests**: Read (for PR context)
- **Actions**: Read (for workflow status)

## Related Documentation

- [Version Management Guide](../docs/VERSION_MANAGEMENT.md) - Comprehensive guide on version management
- [Git Workflow](../.ai-assistant/rules/git-workflow.md) - Branching strategy and commit conventions
- [Deployment](../.ai-assistant/rules/deployment.md) - Deployment process and best practices
