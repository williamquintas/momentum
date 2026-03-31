---
plan name: fix-pwa-store
plan description: Fix PWA Play Store issues
plan status: active
---

## Idea

Fix PWA manifest and assets to pass Google Play Store submission requirements. Issues include: missing PNG icons, missing apple-touch-icon, missing screenshots for desktop/mobile form factors.

## Implementation

- Generate PNG icons: 192x192 (icon-192.png), 512x512 (icon-512.png), and 180x180 (apple-touch-icon.png) for Play Store submission
- Update vite.config.ts manifest to include PNG icons with proper sizes and form_factor
- Add screenshots: one desktop (form_factor: wide) and one mobile (no form_factor)
- Verify manifest.json generates correctly with all required icons
- Update any remaining SVG icon references to use PNG format for Play Store compatibility

## Required Specs

<!-- SPECS_START -->
<!-- SPECS_END -->
