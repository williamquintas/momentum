/**
 * Hook to access theme state
 *
 * This is a convenience hook that wraps useThemeContext.
 * Use this hook in components to access and modify theme state.
 *
 * @example
 * ```tsx
 * const { theme, toggleTheme } = useTheme();
 * ```
 */
export { useThemeContext as useTheme } from '@/contexts/ThemeContext';
