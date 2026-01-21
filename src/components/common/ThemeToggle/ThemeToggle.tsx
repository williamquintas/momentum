/**
 * ThemeToggle Component
 *
 * Switch component to toggle between light and dark themes.
 * Uses Ant Design Switch component with sun/moon icons for visual clarity.
 */

import React from 'react';

import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { Switch, Tooltip } from 'antd';

import { useTheme } from '@/hooks/useTheme';

export interface ThemeToggleProps {
  /**
   * Additional CSS class name
   */
  className?: string;
}

/**
 * ThemeToggle Component
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === 'dark';

  return (
    <Tooltip title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
      <Switch
        checked={isDark}
        onChange={toggleTheme}
        checkedChildren={<MoonOutlined />}
        unCheckedChildren={<SunOutlined />}
        className={className}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      />
    </Tooltip>
  );
};
