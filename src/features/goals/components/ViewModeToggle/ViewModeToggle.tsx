/**
 * ViewModeToggle Component
 *
 * Toggle button to switch between table and list view modes.
 * Uses Ant Design Button.Group for visual clarity.
 */

import React from 'react';

import { Button, Space } from 'antd';

import type { ViewMode } from '@/features/goals/hooks/useViewMode';

export interface ViewModeToggleProps {
  /**
   * Current view mode
   */
  viewMode: ViewMode;

  /**
   * Callback when view mode changes
   */
  onViewModeChange: (mode: ViewMode) => void;

  /**
   * Additional CSS class name
   */
  className?: string;
}

/**
 * ViewModeToggle Component
 */
export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  viewMode,
  onViewModeChange,
  className,
}) => {
  return (
    <Space className={className}>
      <Button.Group>
        <Button
          type={viewMode === 'table' ? 'primary' : 'default'}
          onClick={() => onViewModeChange('table')}
          aria-label="Table view"
        >
          Table
        </Button>
        <Button
          type={viewMode === 'list' ? 'primary' : 'default'}
          onClick={() => onViewModeChange('list')}
          aria-label="List view"
        >
          List
        </Button>
      </Button.Group>
    </Space>
  );
};

