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

import { PlusOutlined, SearchOutlined, FilterOutlined, DownloadOutlined } from '@ant-design/icons';
import { Card, Space, Input, Select, Button, Row, Col, Typography, message, Collapse } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { CreateGoalModal } from '@/features/goals/components/CreateGoalModal';
import { GoalList } from '@/features/goals/components/GoalList';
import { ViewModeToggle } from '@/features/goals/components/ViewModeToggle';
import { useCreateGoal } from '@/features/goals/hooks/useCreateGoal';
import { useGoals } from '@/features/goals/hooks/useGoals';
import { useUpdateGoal } from '@/features/goals/hooks/useUpdateGoal';
import { useViewMode } from '@/features/goals/hooks/useViewMode';
import type { GoalFilters, Goal, CreateGoalInput } from '@/features/goals/types';
import { GoalType, GoalStatus, Priority } from '@/features/goals/types';
import { useMetaTags } from '@/hooks/useMetaTags';
import { usePageTitle } from '@/hooks/usePageTitle';
import { exportGoals, downloadExport } from '@/services/storage/dataExportService';
import { getAvailableGoalTypes } from '@/utils/featureFlags';

const { Title } = Typography;
const { Option } = Select;

/**
 * GoalsPage Component
 */
export const GoalsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { viewMode, setViewMode } = useViewMode();

  // Set page title and meta tags
  usePageTitle(t('goals.title'));
  useMetaTags({
    title: t('goals.title'),
    description:
      'Manage and track your goals. Create, update, and monitor your progress towards achieving your objectives.',
    url: '/goals',
    keywords: ['goals', 'goal management', 'tracking', 'productivity', 'progress'],
  });

  // Get available goal types based on feature flags
  const availableGoalTypes = getAvailableGoalTypes(Object.values(GoalType));

  // Filter state
  const [statusFilter, setStatusFilter] = useState<GoalStatus[] | undefined>(undefined);
  const [typeFilter, setTypeFilter] = useState<GoalType[] | undefined>(undefined);
  const [priorityFilter, setPriorityFilter] = useState<Priority[] | undefined>(undefined);
  const [categoryFilter, setCategoryFilter] = useState<string[] | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [favoriteFilter, setFavoriteFilter] = useState<boolean | undefined>(undefined);
  const [archivedFilter, setArchivedFilter] = useState<boolean | undefined>(undefined);

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
      ...(favoriteFilter !== undefined && { favorite: favoriteFilter }),
      ...(archivedFilter !== undefined && { archived: archivedFilter }),
    }),
    [statusFilter, typeFilter, priorityFilter, categoryFilter, searchQuery, favoriteFilter, archivedFilter]
  );

  // Fetch goals with filters
  const { data: goals = [], isLoading } = useGoals(filters);

  // Create goal mutation
  const createGoal = useCreateGoal();

  // Update goal mutation (for favorite toggle)
  const updateGoal = useUpdateGoal();

  // Handle export
  const handleExport = () => {
    const result = exportGoals();
    if (result.success && result.data) {
      downloadExport(result.data);
      message.success(t('goals.exportSuccess', { count: result.data.goals.length }));
    } else {
      message.error(t('goals.exportError'));
    }
  };

  // Handle goal click - navigate to detail page
  const handleGoalClick = (goal: Goal) => {
    navigate(`/goals/${goal.id}`);
  };

  // Handle toggle favorite
  const handleToggleFavorite = async (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (goal) {
      try {
        await updateGoal.mutateAsync({ id: goalId, updates: { favorite: !goal.favorite, updatedAt: new Date() } });
        void message.success(goal.favorite ? t('goals.removedFromFavorites') : t('goals.addedToFavorites'));
      } catch {
        void message.error(t('goals.failedToUpdateFavorite'));
      }
    }
  };

  // Handle create goal
  const handleCreateGoal = async (values: CreateGoalInput) => {
    try {
      const createdGoal = await createGoal.mutateAsync(values);
      void message.success(t('goals.goalCreatedSuccessfully'));
      setIsCreateModalOpen(false);
      // Navigate to goal detail page after successful creation
      navigate(`/goals/${createdGoal.id}`);
    } catch (error) {
      // Error handling is done by the mutation hook, but we show a user-friendly message
      void message.error(t('goals.failedToCreateGoal'));
      console.error('Error creating goal:', error);
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    setStatusFilter(undefined);
    setTypeFilter(undefined);
    setPriorityFilter(undefined);
    setCategoryFilter(undefined);
    setFavoriteFilter(undefined);
    setArchivedFilter(undefined);
    setSearchQuery('');
  };

  // Check if any filters are active
  const hasActiveFilters = useMemo(
    () =>
      (statusFilter !== undefined && statusFilter.length > 0) ||
      (typeFilter !== undefined && typeFilter.length > 0) ||
      (priorityFilter !== undefined && priorityFilter.length > 0) ||
      (categoryFilter !== undefined && categoryFilter.length > 0) ||
      favoriteFilter !== undefined ||
      archivedFilter !== undefined ||
      searchQuery.trim().length > 0,
    [statusFilter, typeFilter, priorityFilter, categoryFilter, favoriteFilter, archivedFilter, searchQuery]
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
        <Row justify="space-between" align="middle" gutter={[0, { xs: 16, sm: 0 }]}>
          <Col xs={24} sm={12}>
            <Title level={2} style={{ margin: 0 }}>
              {t('goals.goalsList')}
            </Title>
          </Col>
          <Col xs={24} sm={12}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 8 }}>
              <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
              <Button icon={<DownloadOutlined />} onClick={handleExport}>
                {t('goals.export')}
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCreateModalOpen(true)}>
                {t('goals.createGoal')}
              </Button>
            </div>
          </Col>
        </Row>
      </div>

      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {/* Filters - Collapsible on mobile */}
          <Collapse
            ghost
            defaultActiveKey={[]}
            items={[
              {
                key: 'filters',
                label: (
                  <Space>
                    <FilterOutlined />
                    <span>{t('goals.filters')}</span>
                    {hasActiveFilters && <span style={{ color: '#1890ff' }}>{t('goals.filtersActive')}</span>}
                  </Space>
                ),
                children: (
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={8} lg={6}>
                      <Input
                        placeholder={t('goals.searchPlaceholder')}
                        prefix={<SearchOutlined />}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        allowClear
                      />
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6}>
                      <Select
                        placeholder={t('goals.filterByStatus')}
                        style={{ width: '100%' }}
                        mode="multiple"
                        allowClear
                        value={statusFilter}
                        onChange={setStatusFilter}
                      >
                        <Option value={GoalStatus.ACTIVE}>{t('goals.status.active')}</Option>
                        <Option value={GoalStatus.COMPLETED}>{t('goals.status.completed')}</Option>
                        <Option value={GoalStatus.PAUSED}>{t('goals.status.paused')}</Option>
                        <Option value={GoalStatus.CANCELLED}>{t('goals.status.cancelled')}</Option>
                      </Select>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6}>
                      <Select
                        placeholder={t('goals.filterByType')}
                        style={{ width: '100%' }}
                        mode="multiple"
                        allowClear
                        value={typeFilter}
                        onChange={setTypeFilter}
                      >
                        {availableGoalTypes.includes(GoalType.QUANTITATIVE) && (
                          <Option value={GoalType.QUANTITATIVE}>{t('goals.types.quantitative')}</Option>
                        )}
                        {availableGoalTypes.includes(GoalType.QUALITATIVE) && (
                          <Option value={GoalType.QUALITATIVE}>{t('goals.types.qualitative')}</Option>
                        )}
                        {availableGoalTypes.includes(GoalType.BINARY) && (
                          <Option value={GoalType.BINARY}>{t('goals.types.binary')}</Option>
                        )}
                        {availableGoalTypes.includes(GoalType.MILESTONE) && (
                          <Option value={GoalType.MILESTONE}>{t('goals.types.milestone')}</Option>
                        )}
                        {availableGoalTypes.includes(GoalType.RECURRING) && (
                          <Option value={GoalType.RECURRING}>{t('goals.types.recurring')}</Option>
                        )}
                        {availableGoalTypes.includes(GoalType.HABIT) && (
                          <Option value={GoalType.HABIT}>{t('goals.types.habit')}</Option>
                        )}
                      </Select>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6}>
                      <Select
                        placeholder={t('goals.filterByPriority')}
                        style={{ width: '100%' }}
                        mode="multiple"
                        allowClear
                        value={priorityFilter}
                        onChange={setPriorityFilter}
                      >
                        <Option value={Priority.HIGH}>{t('goals.priorities.high')}</Option>
                        <Option value={Priority.MEDIUM}>{t('goals.priorities.medium')}</Option>
                        <Option value={Priority.LOW}>{t('goals.priorities.low')}</Option>
                      </Select>
                    </Col>
                    {availableCategories.length > 0 && (
                      <Col xs={24} sm={12} md={8} lg={6}>
                        <Select
                          placeholder={t('goals.filterByCategory')}
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
                    <Col xs={24} sm={12} md={8} lg={6}>
                      <Select
                        placeholder={t('goals.filterByFavorites')}
                        style={{ width: '100%' }}
                        allowClear
                        value={favoriteFilter}
                        onChange={setFavoriteFilter}
                      >
                        <Option value={true}>{t('goals.favoritesOnly')}</Option>
                        <Option value={false}>{t('goals.nonFavorites')}</Option>
                      </Select>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6}>
                      <Select
                        placeholder={t('goals.filterByArchiveStatus')}
                        style={{ width: '100%' }}
                        allowClear
                        value={archivedFilter}
                        onChange={setArchivedFilter}
                      >
                        <Option value={true}>{t('goals.archivedOnly')}</Option>
                        <Option value={false}>{t('goals.nonArchived')}</Option>
                      </Select>
                    </Col>
                    {hasActiveFilters && (
                      <Col xs={24} sm={12} md={8} lg={6}>
                        <Button onClick={handleClearFilters}>{t('goals.clearFilters')}</Button>
                      </Col>
                    )}
                  </Row>
                ),
              },
            ]}
            className="filters-collapse"
          />

          {/* Goals List */}
          <GoalList
            goals={goals}
            loading={isLoading}
            onGoalClick={handleGoalClick}
            onToggleFavorite={(goalId) => {
              void handleToggleFavorite(goalId);
            }}
            viewMode={viewMode}
          />
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
