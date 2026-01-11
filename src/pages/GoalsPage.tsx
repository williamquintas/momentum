/**
 * GoalsPage Component
 *
 * Main page for displaying and managing goals list.
 * Implements filtering, search, view mode toggle, and goal creation.
 *
 * Features:
 * - Goal list display (table or card view)
 * - Filtering by status, type, priority, category
 * - Search functionality
 * - View mode toggle (table/list)
 * - Create goal button
 * - Empty and loading states
 */

import React, { useState, useMemo } from 'react';

import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Card, Space, Input, Select, Button, Row, Col, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';

import { CreateGoalModal } from '@/features/goals/components/CreateGoalModal';
import { GoalList } from '@/features/goals/components/GoalList';
import { ViewModeToggle } from '@/features/goals/components/ViewModeToggle';
import { useCreateGoal } from '@/features/goals/hooks/useCreateGoal';
import { useGoals } from '@/features/goals/hooks/useGoals';
import { useViewMode } from '@/features/goals/hooks/useViewMode';
import type { GoalFilters, Goal, CreateGoalInput } from '@/features/goals/types';
import { GoalType, GoalStatus, Priority } from '@/features/goals/types';

const { Title } = Typography;
const { Option } = Select;

/**
 * GoalsPage Component
 */
export const GoalsPage: React.FC = () => {
  const navigate = useNavigate();
  const { viewMode, setViewMode } = useViewMode();

  // Filter state
  const [statusFilter, setStatusFilter] = useState<GoalStatus[] | undefined>(undefined);
  const [typeFilter, setTypeFilter] = useState<GoalType[] | undefined>(undefined);
  const [priorityFilter, setPriorityFilter] = useState<Priority[] | undefined>(undefined);
  const [categoryFilter, setCategoryFilter] = useState<string[] | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Create goal modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Build filters object
  const filters: GoalFilters = useMemo(
    () => ({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
      ...(statusFilter && statusFilter.length > 0 && { status: statusFilter }),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
      ...(typeFilter && typeFilter.length > 0 && { type: typeFilter }),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
      ...(priorityFilter && priorityFilter.length > 0 && { priority: priorityFilter }),
      ...(categoryFilter && categoryFilter.length > 0 && { category: categoryFilter }),
      ...(searchQuery.trim() && { search: searchQuery.trim() }),
    }),
    [statusFilter, typeFilter, priorityFilter, categoryFilter, searchQuery]
  );

  // Fetch goals with filters
  const { data: goals = [], isLoading } = useGoals(filters);

  // Create goal mutation
  const createGoal = useCreateGoal();

  // Handle goal click - navigate to detail page
  const handleGoalClick = (goal: Goal) => {
    navigate(`/goals/${goal.id}`);
  };

  // Handle create goal
  const handleCreateGoal = async (values: CreateGoalInput) => {
    try {
      const createdGoal = await createGoal.mutateAsync(values);
      void message.success('Goal created successfully!');
      setIsCreateModalOpen(false);
      // Navigate to goal detail page after successful creation
      navigate(`/goals/${createdGoal.id}`);
    } catch (error) {
      // Error handling is done by the mutation hook, but we show a user-friendly message
      void message.error('Failed to create goal. Please try again.');
      console.error('Error creating goal:', error);
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    setStatusFilter(undefined);
    setTypeFilter(undefined);
    setPriorityFilter(undefined);
    setCategoryFilter(undefined);
    setSearchQuery('');
  };

  // Check if any filters are active
  const hasActiveFilters = useMemo(
    () =>
      (statusFilter !== undefined && statusFilter.length > 0) ||
      (typeFilter !== undefined && typeFilter.length > 0) ||
      (priorityFilter !== undefined && priorityFilter.length > 0) ||
      (categoryFilter !== undefined && categoryFilter.length > 0) ||
      searchQuery.trim().length > 0,
    [statusFilter, typeFilter, priorityFilter, categoryFilter, searchQuery]
  );

  // Get unique categories from goals
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    goals.forEach((goal) => {
      if (goal.category) {
        categories.add(goal.category);
      }
    });
    return Array.from(categories).sort();
  }, [goals]);

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              Goals List
            </Title>
          </Col>
          <Col>
            <Space>
              <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCreateModalOpen(true)}>
                Create Goal
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {/* Filters Row */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Input
                placeholder="Search goals..."
                prefix={<SearchOutlined />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Select
                placeholder="Filter by Status"
                style={{ width: '100%' }}
                mode="multiple"
                allowClear
                value={statusFilter}
                onChange={setStatusFilter}
              >
                <Option value={GoalStatus.ACTIVE}>Active</Option>
                <Option value={GoalStatus.COMPLETED}>Completed</Option>
                <Option value={GoalStatus.PAUSED}>Paused</Option>
                <Option value={GoalStatus.CANCELLED}>Cancelled</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Select
                placeholder="Filter by Type"
                style={{ width: '100%' }}
                mode="multiple"
                allowClear
                value={typeFilter}
                onChange={setTypeFilter}
              >
                <Option value={GoalType.QUANTITATIVE}>Quantitative</Option>
                <Option value={GoalType.QUALITATIVE}>Qualitative</Option>
                <Option value={GoalType.BINARY}>Binary</Option>
                <Option value={GoalType.MILESTONE}>Milestone</Option>
                <Option value={GoalType.RECURRING}>Recurring</Option>
                <Option value={GoalType.HABIT}>Habit</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Select
                placeholder="Filter by Priority"
                style={{ width: '100%' }}
                mode="multiple"
                allowClear
                value={priorityFilter}
                onChange={setPriorityFilter}
              >
                <Option value={Priority.HIGH}>High</Option>
                <Option value={Priority.MEDIUM}>Medium</Option>
                <Option value={Priority.LOW}>Low</Option>
              </Select>
            </Col>
            {availableCategories.length > 0 && (
              <Col xs={24} sm={12} md={8} lg={6}>
                <Select
                  placeholder="Filter by Category"
                  style={{ width: '100%' }}
                  mode="multiple"
                  allowClear
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                >
                  {availableCategories.map((category) => (
                    <Option key={category} value={category}>
                      {category}
                    </Option>
                  ))}
                </Select>
              </Col>
            )}
            {hasActiveFilters && (
              <Col xs={24} sm={12} md={8} lg={6}>
                <Button onClick={handleClearFilters}>Clear Filters</Button>
              </Col>
            )}
          </Row>

          {/* Goals List */}
          <GoalList goals={goals} loading={isLoading} onGoalClick={handleGoalClick} viewMode={viewMode} />
        </Space>
      </Card>

      {/* Create Goal Modal */}
      <CreateGoalModal
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateGoal}
        loading={createGoal.isPending}
      />
    </div>
  );
};
