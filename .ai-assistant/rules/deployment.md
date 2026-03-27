# Deployment

## Build Process

### Build Tool Configuration

- **Webpack** (if using Create React App or custom setup):
  - Optimize bundle splitting
  - Configure code splitting by route
  - Set up proper chunk naming

### Production Build Optimizations

- **Code Splitting**:
  - Split by route (React Router)
  - Split vendor dependencies
  - Lazy load heavy components
  - Dynamic imports for large features
- **Tree Shaking**:
  - Ensure ES modules are used
  - Remove unused Ant Design components
  - Remove unused utility functions
- **Asset Optimization**:
  - Minify JavaScript and CSS
  - Compress images (WebP, optimized formats)
  - Inline critical CSS
  - Optimize fonts (subset, preload)
- **Source Maps**:
  - Generate source maps for production (optional, for debugging)
  - Use `hidden-source-map` or `source-map` based on security needs
  - Consider separate source map files vs inline

### Build Output

- Generate optimized bundles with content hashing
- Create asset manifest for cache busting
- Generate service worker (if PWA)
- Include build metadata (version, timestamp)

## Environment Configuration

- Use environment variables for configuration (see [Environment Configuration](./environment-config.md))
- Different configs for dev/staging/prod
- Never commit secrets
- Validate environment variables at build time
- Use `.env.example` for documentation
- Ensure build tool prefix is correct (VITE*\*, REACT_APP*\*, etc.)

## CI/CD Pipeline

### Continuous Integration

- **On Every Commit/PR**:
  - Run unit tests (`npm test` or `npm run test`)
  - Run linting (`npm run lint`)
  - Run type checking (`npm run type-check` or `tsc --noEmit`)
  - Run build verification (`npm run build`)
  - Run security scans (`npm audit` or Snyk/Dependabot)
  - Check code coverage thresholds
  - Validate environment variable configuration

### Continuous Deployment

- **Staging Environment**:
  - Auto-deploy on merge to `develop` or `staging` branch
  - Run integration tests after deployment
  - Notify team on deployment success/failure
- **Production Environment**:
  - Manual approval required (via PR merge or deployment tool)
  - Deploy from `main` or `master` branch only
  - Tag releases with semantic versioning
  - Rollback capability must be tested and documented
  - Health checks before marking deployment complete

### CI/CD Tools

- **GitHub Actions** (recommended):
  - Use reusable workflows
  - Cache dependencies (`node_modules`, build artifacts)
  - Matrix builds for multiple Node versions (if needed)
  - Parallel job execution
- **Alternative Platforms**:
  - GitLab CI/CD
  - CircleCI
  - Jenkins
  - Azure DevOps

## Deployment Environments

### Development

- **Purpose**: Local development and testing
- **Configuration**: `.env.development` or `.env.local`
- **Features**:
  - Hot module replacement enabled
  - Source maps enabled
  - Verbose logging
  - Development tools enabled (React DevTools, Redux DevTools)
  - Mock API or local API server
- **Access**: Localhost only

### Staging

- **Purpose**: Pre-production testing and QA
- **Configuration**: `.env.staging`
- **Features**:
  - Production-like build optimizations
  - Staging API endpoints
  - Error tracking enabled (separate project)
  - Analytics enabled (test mode)
  - Feature flags for testing
- **Access**: Internal team and stakeholders
- **Data**: Use test data or sanitized production data

### Production

- **Purpose**: Live application for end users
- **Configuration**: `.env.production`
- **Features**:
  - Full production optimizations
  - Production API endpoints
  - Error tracking enabled
  - Analytics enabled
  - Feature flags for gradual rollouts
  - CDN for static assets
- **Access**: Public
- **Data**: Real production data
- **Security**: HTTPS required, security headers configured

## Build Artifacts

- Generate optimized bundles
- Include source maps (optional in prod)
- Generate asset manifest
- Create deployment package
- Version build artifacts

## Deployment Strategy

- Blue-green deployment (if applicable)
- Canary releases (if applicable)
- Rolling updates
- Feature flags for gradual rollouts
- Rollback procedures

## Pre-Deployment Checklist

### Code Quality

- [ ] All unit tests passing (`npm test`)
- [ ] All integration tests passing
- [ ] Linting passes (`npm run lint`)
- [ ] Type checking passes (`npm run type-check` or `tsc --noEmit`)
- [ ] No TypeScript errors
- [ ] Code review completed and approved
- [ ] No console errors or warnings in development

### Security

- [ ] Security audit completed (`npm audit`)
- [ ] No known vulnerabilities in dependencies
- [ ] Environment variables validated (no secrets in code)
- [ ] API keys and secrets properly configured
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] Input validation in place

### Performance

- [ ] Performance testing done (Lighthouse score > 90)
- [ ] Bundle size within acceptable limits
- [ ] Images optimized and compressed
- [ ] Code splitting implemented
- [ ] Lazy loading for heavy components
- [ ] Core Web Vitals meet thresholds

### Accessibility

- [ ] Accessibility checks passed (a11y testing)
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility verified
- [ ] Color contrast meets WCAG standards
- [ ] ARIA labels properly implemented

### Functionality

- [ ] Critical user flows tested
- [ ] All goal types working correctly
- [ ] API integration tested
- [ ] Error handling verified
- [ ] Loading states work correctly
- [ ] Offline functionality tested (if PWA)

### Configuration

- [ ] Environment variables configured for target environment
- [ ] API endpoints correct for environment
- [ ] Feature flags configured appropriately
- [ ] Analytics tracking configured
- [ ] Error tracking (Sentry) configured
- [ ] Database migrations run (if applicable)

### Documentation

- [ ] README updated if needed
- [ ] Changelog updated
- [ ] API documentation updated (if applicable)
- [ ] Deployment notes documented
- [ ] Known issues documented

## Post-Deployment

### Immediate Verification (First 5 minutes)

- [ ] Verify deployment success (check deployment platform status)
- [ ] Confirm application is accessible
- [ ] Verify correct version is deployed
- [ ] Check environment variables are loaded correctly
- [ ] Verify API connectivity
- [ ] Check console for errors (browser DevTools)

### Smoke Tests (First 15 minutes)

- [ ] Run automated smoke tests (if available)
- [ ] Test critical user flows:
  - [ ] User login/authentication
  - [ ] Create a goal
  - [ ] Update a goal
  - [ ] View goals list
  - [ ] Delete a goal (if applicable)
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Test on mobile devices (if applicable)
- [ ] Verify PWA functionality (if applicable)

### Monitoring (First 30 minutes)

- [ ] Monitor error rates (Sentry, error tracking)
- [ ] Check performance metrics (Core Web Vitals)
- [ ] Monitor API response times
- [ ] Check for increased error rates
- [ ] Monitor user session data
- [ ] Watch for any anomalies

### Feature Verification

- [ ] Verify critical features work as expected
- [ ] Test new features (if this is a feature release)
- [ ] Verify bug fixes (if this is a bug fix release)
- [ ] Check feature flags are working correctly
- [ ] Verify analytics tracking is working

### User Impact

- [ ] Monitor user feedback channels
- [ ] Check support tickets/emails
- [ ] Monitor social media mentions (if applicable)
- [ ] Watch for user-reported issues
- [ ] Check user engagement metrics

### Extended Monitoring (24-48 hours)

- [ ] Continue monitoring error rates
- [ ] Track performance trends
- [ ] Monitor user adoption of new features
- [ ] Collect user feedback
- [ ] Document any issues encountered

## Health Checks

### Client-Side Health Checks

- **Application Status**:
  - Check if critical services are accessible
  - Verify API connectivity
  - Monitor React Query cache health
  - Check localStorage/sessionStorage availability
- **Performance Monitoring**:
  - Track Core Web Vitals (LCP, FID, CLS)
  - Monitor bundle load times
  - Track API response times
  - Monitor error rates

### Server-Side Health Checks (if applicable)

- Implement health check endpoint (`/health` or `/api/health`)
- Return application status, version, and dependencies
- Monitor database connectivity (if applicable)
- Check external service availability
- Set up alerts for failures
- Track uptime metrics

### Monitoring Integration

- Integrate with error tracking (Sentry, LogRocket)
- Set up performance monitoring
- Configure alerting thresholds
- Monitor user-reported issues
- Track deployment impact on metrics

## Rollback Procedure

### When to Rollback

- Critical bugs affecting core functionality
- Security vulnerabilities discovered
- Performance degradation (>50% slower)
- High error rate (>5% of requests failing)
- Data loss or corruption
- Service unavailability

### Rollback Steps

1. **Immediate Actions**:
   - Stop any ongoing deployments
   - Assess severity and impact
   - Notify team and stakeholders
   - Document the issue

2. **Platform-Specific Rollback**:
   - **Vercel**: Use deployment history to revert to previous deployment
   - **Netlify**: Use "Publish previous deploy" option
   - **AWS**: Deploy previous build artifact
   - **Custom**: Restore from backup or previous build

3. **Verification**:
   - Verify rollback was successful
   - Run smoke tests
   - Monitor error rates
   - Confirm application is functional

4. **Post-Rollback**:
   - Document what went wrong
   - Create issue to fix the problem
   - Communicate rollback to team
   - Plan fix and re-deployment

### Rollback Testing

- Test rollback procedure in staging environment
- Document rollback steps for each deployment platform
- Ensure previous builds are accessible
- Verify rollback can be completed within 5 minutes

### Prevention

- Use feature flags for risky changes
- Deploy to staging first
- Use canary deployments for major changes
- Monitor closely after deployment
- Have rollback plan ready before deploying

## Deployment Tools

### Platform Selection

Choose based on project needs:

- **Vercel** (recommended for React apps):
  - Zero-config deployment
  - Automatic HTTPS
  - Edge network (CDN)
  - Preview deployments for PRs
  - Environment variables management
  - Build command: `npm run build`
  - Output directory: `dist` or `build`
- **Netlify**:
  - Similar to Vercel
  - Good for static sites and SPAs
  - Form handling and serverless functions
  - Build command: `npm run build`
  - Publish directory: `dist` or `build`
- **AWS (S3 + CloudFront)**:
  - Full control over infrastructure
  - Cost-effective for high traffic
  - Requires more setup
  - Use AWS CLI or Terraform for automation
- **GitHub Pages**:
  - Free for public repos
  - Simple static hosting
  - Limited to static assets
  - Use `gh-pages` package for deployment

### Platform Configuration

- **Build Settings**:
  - Node version (specify in `.nvmrc` or `package.json` engines)
  - Build command: `npm ci && npm run build`
  - Install command: `npm ci` (for reproducible builds)
  - Output directory: `dist` or `build` (based on build tool)
- **Environment Variables**:
  - Set in platform dashboard
  - Use different values per environment
  - Never commit secrets
  - Validate required variables are set
- **Custom Domains**:
  - Configure DNS records (CNAME or A record)
  - Enable SSL/TLS certificates (usually automatic)
  - Set up redirects (www to non-www or vice versa)
  - Configure custom headers (security headers, CORS)

### React Router Configuration

- **Single Page Application (SPA) Routing**:
  - Configure redirect rules for client-side routing
  - All routes should redirect to `index.html`
  - Example (`_redirects` for Netlify or `vercel.json` for Vercel):
    ```
    /*    /index.html   200
    ```
  - Or use `rewrites` in platform configuration

## Monitoring Deployment

- Track deployment success/failure
- Monitor application after deployment
- Watch error rates
- Check performance metrics
- Monitor user impact

## Version Management

### Semantic Versioning

- Follow `MAJOR.MINOR.PATCH` format
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)
- Use `npm version` command for version bumps

### Release Process

- **Tagging**: Tag releases with `git tag v1.0.0`
- **Changelog**: Maintain `CHANGELOG.md` with all changes
- **Release Notes**: Generate release notes from commits or changelog
- **Version Display**: Show version in application (footer, about page, or debug info)
  ```typescript
  // Example: Display version in app
  const APP_VERSION = import.meta.env.VITE_APP_VERSION || 'dev';
  ```

### Automated Versioning

- Use tools like `standard-version` or `semantic-release`
- Automatically bump version based on commit messages
- Generate changelog automatically
- Create git tags automatically

### Version in Build

- Inject version at build time via environment variable
- Include version in bundle for debugging
- Display version in error reports
- Track version in analytics events

## Database Migrations

### Migration Process

- **Pre-Deployment**:
  - Run migrations before deploying application code
  - Test migrations in staging environment first
  - Backup database before running migrations
  - Verify migration scripts are idempotent
- **Migration Strategy**:
  - Use backward-compatible migrations when possible
  - Deploy in phases (additive changes first, breaking changes later)
  - Test rollback migration scripts
  - Document migration steps and dependencies

### Best Practices

- Never run migrations directly in production without testing
- Always backup database before migrations
- Test migrations with production-like data volume
- Have rollback plan for each migration
- Monitor database performance during migrations
- Run migrations during low-traffic periods
- Document migration process and dependencies

### Migration Tools

- Use migration tools (e.g., Prisma, TypeORM, Knex.js)
- Version control migration files
- Track migration history
- Automate migration execution in CI/CD (with caution)

## PWA Deployment Considerations

### Service Worker

- **Registration**: Ensure service worker is registered in production only
- **Caching Strategy**:
  - Cache static assets (CSS, JS, images)
  - Use network-first for API calls
  - Implement cache versioning for updates
  - Handle offline scenarios gracefully
- **Update Strategy**:
  - Prompt users to refresh when new version is available
  - Use skipWaiting() carefully
  - Handle service worker updates gracefully

### Manifest Configuration

- Ensure `manifest.json` is properly configured
- Set correct start URL and scope
- Configure icons for all required sizes
- Set theme color and display mode
- Test PWA installation on mobile devices

### HTTPS Requirement

- PWAs require HTTPS (except localhost)
- Ensure SSL certificate is valid
- Configure security headers (CSP, HSTS)

## Caching Strategy

### Static Assets

- **Cache-Control Headers**:
  - HTML: `no-cache` or `max-age=0` (always check for updates)
  - JS/CSS with hash: `max-age=31536000, immutable` (long-term cache)
  - Images: `max-age=86400` (1 day) or longer
  - Fonts: `max-age=31536000, immutable`
- **CDN Configuration**:
  - Use CDN for static assets
  - Configure proper cache headers
  - Enable compression (gzip, brotli)
  - Use HTTP/2 or HTTP/3

### API Responses

- Use React Query caching for API responses
- Configure appropriate stale times
- Implement cache invalidation strategies
- Handle cache updates on mutations

## Performance Optimization

### Bundle Size

- Monitor bundle size with `npm run build -- --analyze` (if configured)
- Set size limits in CI/CD (e.g., fail if bundle exceeds threshold)
- Use dynamic imports for large dependencies
- Remove unused Ant Design components
- Optimize images before deployment

### Loading Performance

- Implement code splitting by route
- Lazy load heavy components
- Preload critical resources
- Optimize font loading (font-display: swap)
- Minimize render-blocking resources

## React-Specific Deployment Considerations

### Build Output

- **Static Assets**: All React code is compiled to static JavaScript/CSS
- **Routing**: Configure server/CDN to handle client-side routing (SPA)
- **Environment Variables**: Must be prefixed correctly (VITE*\*, REACT_APP*\*, etc.)
- **Public Assets**: Place in `public/` directory (Vite) or `public/` (CRA)

### State Management

- **Zustand/Redux State**: Client-side only, no server-side concerns
- **React Query Cache**: Consider cache invalidation on deployment
- **Local Storage**: May need migration if data structure changes

### Performance

- **Code Splitting**: Use React.lazy() for route-based splitting
- **Bundle Analysis**: Regularly analyze bundle size
- **Tree Shaking**: Ensure ES modules are used for proper tree shaking
- **Ant Design**: Import only needed components to reduce bundle size

### Error Boundaries

- Ensure error boundaries are in place
- Configure error reporting (Sentry) to catch production errors
- Test error boundaries in production-like environment

### Browser Compatibility

- Test on target browsers
- Configure Babel/polyfills for older browsers (if needed)
- Use feature detection for modern APIs

## Best Practices

### Deployment Process

- **Automation**: Automate deployment process completely
- **Testing**: Test in staging first, never deploy untested code
- **Timing**: Deploy during low-traffic periods when possible
- **Communication**: Notify team before/after deployments
- **Documentation**: Document deployment process and rollback steps

### Code Quality

- All tests must pass before deployment
- Code review required for production deployments
- No direct commits to main/master branch
- Use feature branches and pull requests

### Monitoring

- Monitor after deployment (first 15-30 minutes critical)
- Watch error rates and performance metrics
- Check user feedback channels
- Verify critical user flows
- Monitor API error rates

### Security

- Never commit secrets or API keys
- Use environment variables for sensitive data
- Enable security headers (CSP, HSTS, X-Frame-Options)
- Regular security audits
- Keep dependencies updated

### Rollback Readiness

- Always have rollback plan ready
- Test rollback procedure in staging
- Keep previous deployment artifacts
- Document rollback steps clearly
- Have rollback decision criteria defined
