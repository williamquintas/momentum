import type { ReactNode } from 'react';

import { ConfigProvider } from 'antd';

import { ThemeContextProvider, useThemeContext } from '@/contexts/ThemeContext';
import { darkTheme, lightTheme } from '@/theme';

/**
 * Internal component that applies Ant Design theme based on context
 */
const ThemeConfigProvider = ({ children }: { children: ReactNode }) => {
  const { theme } = useThemeContext();
  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;

  return <ConfigProvider theme={currentTheme}>{children}</ConfigProvider>;
};

/**
 * ThemeProvider Component
 *
 * Provides theme context and applies Ant Design theme configuration
 * based on the current theme mode (light/dark).
 */
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeContextProvider>
      <ThemeConfigProvider>{children}</ThemeConfigProvider>
    </ThemeContextProvider>
  );
};
