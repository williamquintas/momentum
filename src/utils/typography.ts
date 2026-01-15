/**
 * Typography Utilities
 *
 * Centralized typography constants and utilities for consistent
 * font usage throughout the application.
 */

/**
 * Font families used in the application
 */
export const FONTS = {
  body: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  heading: "'Space Grotesk', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
} as const;

/**
 * CSS custom properties for fonts
 */
export const FONT_VARIABLES = {
  body: 'var(--font-body)',
  heading: 'var(--font-heading)',
} as const;

/**
 * Typography styles for inline use
 */
export const typography = {
  body: {
    fontFamily: FONTS.body,
  },
  heading: {
    fontFamily: FONTS.heading,
    fontWeight: 600,
  },
  metric: {
    fontFamily: FONTS.heading,
    fontWeight: 600,
  },
} as const;

