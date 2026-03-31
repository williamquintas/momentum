# Quickstart: PWA Support

**Feature**: PWA Support  
**Date**: 2026-03-30

## Prerequisites

- Node.js >= 24.0.0
- npm >= 10.0.0

## Setup

1. Install vite-plugin-pwa:

   ```bash
   npm install vite-plugin-pwa
   ```

2. Configure vite.config.ts with PWA settings

3. Add icons to public/icons/ (192x192, 512x512 minimum)

4. Add install button to Header component

## Development

Run the dev server as usual:

```bash
npm run dev
```

PWA features work in development with some limitations. Test full PWA functionality in production build.

## Production Build

```bash
npm run build
npm run preview
```

## Verification

1. Open browser DevTools > Application > Service Workers - should be registered
2. Check Manifest in DevTools - should show app name, icons, display mode
3. Test offline: disable network, reload page - app should still load
4. Test install: should see install prompt or button in header
