/**
 * GoalsPage Component
 *
 * Main page for displaying and managing goals list.
 * Implements filtering, search, view mode toggle, and goal creation.
 *
 * Features:
 * - Goal list display (table or card view)
 * - Filtering by status, type, priority, category (drawer on mobile, bar on desktop)
 * - Search functionality
 * - View mode toggle (table/list)
 * - FAB for create goal (mobile), header button (desktop)
 * - Empty and loading states
 */

import React, { useState, useMemo } from 'react';

import { PlusOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import {
  Card,
  Space,
  Input,
  Select,
  Button,
  Row,
  Col,
  Typography,
  message,
  Drawer,
  Tag,
  FloatButton,
  Grid,
  Segmented,
} from 'antd';
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
import { getAvailableGoalTypes } from '@/utils/featureFlags';

const { Title, Text } = Typography;
const { Option } = Select;

export const GoalsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { viewMode, setViewMode } = useViewMode();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.lg;

  usePageTitle(t('goals.title'));
  useMetaTags({
    title: t('goals.title'),
    description:
      'Manage and track your goals. Create, update, and monitor your progress towards achieving your objectives.',
    url: '/goals',
    keywords: ['goals', 'goal management', 'tracking', 'productivity', 'progress'],
  });

  const availableGoalTypes = getAvailableGoalTypes(Object.values(GoalType));

  const [statusFilter, setStatusFilter] = useState<GoalStatus[] | undefined>([GoalStatus.ACTIVE]);
  const [typeFilter, setTypeFilter] = useState<GoalType[] | undefined>(undefined);
  const [priorityFilter, setPriorityFilter] = useState<Priority[] | undefined>(undefined);
  const [categoryFilter, setCategoryFilter] = useState<string[] | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [favoriteFilter, setFavoriteFilter] = useState<boolean | undefined>(undefined);
  const [archivedFilter, setArchivedFilter] = useState<boolean | undefined>(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const filters: GoalFilters = useMemo(
    () => ({
      ...(statusFilter && statusFilter.length > 0 && { status: statusFilter }),
      ...(typeFilter && typeFilter.length > 0 && { type: typeFilter }),
      ...(priorityFilter && priorityFilter.length > 0 && { priority: priorityFilter }),
      ...(categoryFilter && categoryFilter.length > 0 && { category: categoryFilter }),
      ...(searchQuery.trim() && { search: searchQuery.trim() }),
      ...(favoriteFilter !== undefined && { favorite: favoriteFilter }),
      ...(archivedFilter !== undefined && { archived: archivedFilter }),
    }),
    [statusFilter, typeFilter, priorityFilter, categoryFilter, searchQuery, favoriteFilter, archivedFilter]
  );

  const { data: goals = [], isLoading } = useGoals(filters);
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();

  const handleGoalClick = (goal: Goal) => {
    navigate(`/goals/${goal.id}`);
  };

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

  const handleCreateGoal = async (values: CreateGoalInput) => {
    try {
      const createdGoal = await createGoal.mutateAsync(values);
      void message.success(t('goals.goalCreatedSuccessfully'));
      setIsCreateModalOpen(false);
      navigate(`/goals/${createdGoal.id}`);
    } catch (error) {
      void message.error(t('goals.failedToCreateGoal'));
      console.error('Error creating goal:', error);
    }
  };

  const handleClearFilters = () => {
    setStatusFilter([GoalStatus.ACTIVE]);
    setTypeFilter(undefined);
    setPriorityFilter(undefined);
    setCategoryFilter(undefined);
    setFavoriteFilter(undefined);
    setArchivedFilter(false);
    setSearchQuery('');
  };

  const handleApplyFilters = () => {
    setFilterDrawerOpen(false);
  };

  const hasActiveFilters = useMemo(
    () =>
      (statusFilter !== undefined &&
        statusFilter.length > 0 &&
        (statusFilter.length !== 1 || statusFilter[0] !== GoalStatus.ACTIVE)) ||
      (typeFilter !== undefined && typeFilter.length > 0) ||
      (priorityFilter !== undefined && priorityFilter.length > 0) ||
      (categoryFilter !== undefined && categoryFilter.length > 0) ||
      favoriteFilter !== undefined ||
      archivedFilter === true ||
      searchQuery.trim().length > 0,
    [statusFilter, typeFilter, priorityFilter, categoryFilter, favoriteFilter, archivedFilter, searchQuery]
  );

  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    goals.forEach((goal) => {
      if (goal.category) {
        categories.add(goal.category);
      }
    });
    return Array.from(categories).sort();
  }, [goals]);

  const activeFilterTags = useMemo(() => {
    const tags: { key: string; label: string; close: () => void }[] = [];

    if (statusFilter && statusFilter.length > 0) {
      tags.push({
        key: 'status',
        label: `${t('goals.status.label')}: ${statusFilter.join(', ')}`,
        close: () => setStatusFilter(undefined),
      });
    }
    if (typeFilter && typeFilter.length > 0) {
      tags.push({
        key: 'type',
        label: `${t('goals.type')}: ${typeFilter.join(', ')}`,
        close: () => setTypeFilter(undefined),
      });
    }
    if (priorityFilter && priorityFilter.length > 0) {
      tags.push({
        key: 'priority',
        label: `${t('goals.priority')}: ${priorityFilter.join(', ')}`,
        close: () => setPriorityFilter(undefined),
      });
    }
    if (categoryFilter && categoryFilter.length > 0) {
      tags.push({
        key: 'category',
        label: `${t('goals.category')}: ${categoryFilter.join(', ')}`,
        close: () => setCategoryFilter(undefined),
      });
    }
    if (favoriteFilter !== undefined) {
      tags.push({
        key: 'favorite',
        label: favoriteFilter ? t('goals.favoritesOnly') : t('goals.nonFavorites'),
        close: () => setFavoriteFilter(undefined),
      });
    }
    if (archivedFilter !== undefined) {
      tags.push({
        key: 'archived',
        label: archivedFilter ? t('goals.archivedOnly') : t('goals.nonArchived'),
        close: () => setArchivedFilter(undefined),
      });
    }
    if (searchQuery.trim()) {
      tags.push({
        key: 'search',
        label: `"${searchQuery}"`,
        close: () => setSearchQuery(''),
      });
    }

    return tags;
  }, [statusFilter, typeFilter, priorityFilter, categoryFilter, favoriteFilter, archivedFilter, searchQuery, t]);

  return (
    <div style={{ paddingBottom: isMobile ? 80 : 0 }}>
      {/* Desktop Header */}
      {!isMobile && (
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              {t('goals.goalsList')}
            </Title>
          </Col>
          <Col>
            <Space>
              <Segmented
                options={[
                  { label: t('viewMode.list'), value: 'list' },
                  { label: t('viewMode.table'), value: 'table' },
                ]}
                value={viewMode}
                onChange={(val) => setViewMode(val as 'list' | 'table')}
              />
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCreateModalOpen(true)}>
                {t('goals.createGoal')}
              </Button>
            </Space>
          </Col>
        </Row>
      )}

      {/* Desktop Filter Bar */}
      {!isMobile && (
        <div style={{ marginBottom: 16 }}>
          <Space wrap size="middle" style={{ marginBottom: hasActiveFilters ? 16 : 0 }}>
            <Input
              placeholder={t('goals.searchPlaceholder')}
              prefix={<SearchOutlined />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
              style={{ minWidth: 160 }}
            />
            <Select
              placeholder={t('goals.filterByStatus')}
              mode="multiple"
              allowClear
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ minWidth: 140 }}
            >
              <Option value={GoalStatus.ACTIVE}>{t('goals.status.active')}</Option>
              <Option value={GoalStatus.COMPLETED}>{t('goals.status.completed')}</Option>
              <Option value={GoalStatus.PAUSED}>{t('goals.status.paused')}</Option>
              <Option value={GoalStatus.CANCELLED}>{t('goals.status.cancelled')}</Option>
            </Select>
            <Select
              placeholder={t('goals.filterByPriority')}
              mode="multiple"
              allowClear
              value={priorityFilter}
              onChange={setPriorityFilter}
              style={{ minWidth: 140 }}
            >
              <Option value={Priority.HIGH}>{t('goals.priorities.high')}</Option>
              <Option value={Priority.MEDIUM}>{t('goals.priorities.medium')}</Option>
              <Option value={Priority.LOW}>{t('goals.priorities.low')}</Option>
            </Select>
            {availableCategories.length > 0 && (
              <Select
                placeholder={t('goals.filterByCategory')}
                mode="multiple"
                allowClear
                value={categoryFilter}
                onChange={setCategoryFilter}
                style={{ minWidth: 140 }}
              >
                {availableCategories.map((category) => (
                  <Option key={category} value={category}>
                    {category}
                  </Option>
                ))}
              </Select>
            )}
            <Select
              placeholder={t('goals.filterByFavorites')}
              allowClear
              value={favoriteFilter}
              onChange={setFavoriteFilter}
              style={{ minWidth: 130 }}
            >
              <Option value={true}>{t('goals.favoritesOnly')}</Option>
              <Option value={false}>{t('goals.nonFavorites')}</Option>
            </Select>
            <Select
              placeholder={t('goals.filterByArchiveStatus')}
              allowClear
              value={archivedFilter}
              onChange={setArchivedFilter}
              style={{ minWidth: 130 }}
            >
              <Option value={false}>{t('goals.nonArchived')}</Option>
              <Option value={true}>{t('goals.archivedOnly')}</Option>
            </Select>
          </Space>
          {hasActiveFilters && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {activeFilterTags.map((tag) => (
                <Tag key={tag.key} closable onClose={tag.close} color="blue">
                  {tag.label}
                </Tag>
              ))}
              <Button type="link" size="small" onClick={handleClearFilters}>
                {t('goals.clearFilters')}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Mobile Header */}
      {isMobile && (
        <div style={{ marginBottom: 16 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={2} style={{ margin: 0 }}>
                {t('goals.goalsList')}
              </Title>
            </Col>
            <Col>
              <Space>{<ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />}</Space>
            </Col>
          </Row>
        </div>
      )}

      {isMobile && (
        <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
          <Col xs={24}>
            <Space style={{ width: '100%' }}>
              <Button
                icon={<FilterOutlined />}
                onClick={() => setFilterDrawerOpen(true)}
                type={hasActiveFilters ? 'primary' : 'default'}
              >
                {t('goals.filters')}
                {hasActiveFilters && ` (${activeFilterTags.length})`}
              </Button>
            </Space>
          </Col>
        </Row>
      )}

      <Card>
        <GoalList
          goals={goals}
          loading={isLoading}
          onGoalClick={handleGoalClick}
          onToggleFavorite={(goalId) => {
            void handleToggleFavorite(goalId);
          }}
          viewMode={viewMode}
        />
      </Card>

      {isMobile && (
        <FloatButton
          icon={<PlusOutlined />}
          type="primary"
          onClick={() => setIsCreateModalOpen(true)}
          style={{ right: 24, bottom: 70 }}
        />
      )}

      <Drawer
        title={t('goals.filters')}
        placement="bottom"
        onClose={() => setFilterDrawerOpen(false)}
        open={filterDrawerOpen}
        height="70vh"
        extra={
          <Space>
            <Button onClick={handleClearFilters}>{t('goals.clearFilters')}</Button>
            <Button type="primary" onClick={handleApplyFilters}>
              {t('common.apply')}
            </Button>
          </Space>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Input
            placeholder={t('goals.searchPlaceholder')}
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
          />

          <div>
            <Text type="secondary" style={{ marginBottom: 8, display: 'block' }}>
              {t('goals.filterByStatus')}
            </Text>
            <Select
              style={{ width: '100%' }}
              mode="multiple"
              allowClear
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder={t('goals.filterByStatus')}
            >
              <Option value={GoalStatus.ACTIVE}>{t('goals.status.active')}</Option>
              <Option value={GoalStatus.COMPLETED}>{t('goals.status.completed')}</Option>
              <Option value={GoalStatus.PAUSED}>{t('goals.status.paused')}</Option>
              <Option value={GoalStatus.CANCELLED}>{t('goals.status.cancelled')}</Option>
            </Select>
          </div>

          <div>
            <Text type="secondary" style={{ marginBottom: 8, display: 'block' }}>
              {t('goals.filterByType')}
            </Text>
            <Select
              style={{ width: '100%' }}
              mode="multiple"
              allowClear
              value={typeFilter}
              onChange={setTypeFilter}
              placeholder={t('goals.filterByType')}
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
          </div>

          <div>
            <Text type="secondary" style={{ marginBottom: 8, display: 'block' }}>
              {t('goals.filterByPriority')}
            </Text>
            <Select
              style={{ width: '100%' }}
              mode="multiple"
              allowClear
              value={priorityFilter}
              onChange={setPriorityFilter}
              placeholder={t('goals.filterByPriority')}
            >
              <Option value={Priority.HIGH}>{t('goals.priorities.high')}</Option>
              <Option value={Priority.MEDIUM}>{t('goals.priorities.medium')}</Option>
              <Option value={Priority.LOW}>{t('goals.priorities.low')}</Option>
            </Select>
          </div>

          {availableCategories.length > 0 && (
            <div>
              <Text type="secondary" style={{ marginBottom: 8, display: 'block' }}>
                {t('goals.filterByCategory')}
              </Text>
              <Select
                style={{ width: '100%' }}
                mode="multiple"
                allowClear
                value={categoryFilter}
                onChange={setCategoryFilter}
                placeholder={t('goals.filterByCategory')}
              >
                {availableCategories.map((category) => (
                  <Option key={category} value={category}>
                    {category}
                  </Option>
                ))}
              </Select>
            </div>
          )}

          <div>
            <Text type="secondary" style={{ marginBottom: 8, display: 'block' }}>
              {t('goals.filterByFavorites')}
            </Text>
            <Select
              style={{ width: '100%' }}
              allowClear
              value={favoriteFilter}
              onChange={setFavoriteFilter}
              placeholder={t('goals.filterByFavorites')}
            >
              <Option value={true}>{t('goals.favoritesOnly')}</Option>
              <Option value={false}>{t('goals.nonFavorites')}</Option>
            </Select>
          </div>

          <div>
            <Text type="secondary" style={{ marginBottom: 8, display: 'block' }}>
              {t('goals.filterByArchiveStatus')}
            </Text>
            <Select
              style={{ width: '100%' }}
              allowClear
              value={archivedFilter}
              onChange={setArchivedFilter}
              placeholder={t('goals.filterByArchiveStatus')}
            >
              <Option value={true}>{t('goals.archivedOnly')}</Option>
              <Option value={false}>{t('goals.nonArchived')}</Option>
            </Select>
          </div>
        </Space>
      </Drawer>

      <CreateGoalModal
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateGoal}
        loading={createGoal.isPending}
      />
    </div>
  );
};
