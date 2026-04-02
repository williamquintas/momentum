/**
 * GoalDetail Component
 *
 * Comprehensive goal detail view displaying all goal information,
 * progress visualization, type-specific displays, and action buttons.
 * Follows the mockup specifications for goal detail view.
 */

import React, { useState } from 'react';

import {
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  PaperClipOutlined,
  RiseOutlined,
  StarOutlined,
  StarFilled,
  InboxOutlined,
} from '@ant-design/icons';
import {
  Card,
  Descriptions,
  Progress,
  Tag,
  Space,
  Typography,
  Button,
  Divider,
  Steps,
  Timeline,
  List,
  Empty,
  Popconfirm,
  Row,
  Col,
  Statistic,
} from 'antd';
import { useTranslation } from 'react-i18next';

import type { UpdateProgressInput } from '@/features/goals/hooks/useUpdateProgress';
import type { Goal } from '@/features/goals/types';
import {
  isQuantitativeGoal,
  isQualitativeGoal,
  isBinaryGoal,
  isMilestoneGoal,
  isRecurringGoal,
  isHabitGoal,
  QualitativeStatus,
} from '@/features/goals/types';
import { calculateProgress } from '@/features/goals/utils/calculateProgress';
import { getStatusColor, getPriorityColor } from '@/features/goals/utils/colorUtils';
import {
  formatDate,
  isOverdue,
  isDueSoon,
  getDeadlineStatusText,
  getDaysUntilDeadline,
} from '@/features/goals/utils/dateUtils';
import { formatProgress } from '@/features/goals/utils/progressUtils';
import { isFeatureEnabled } from '@/utils/featureFlags';

import { UpdateProgressModal } from '../UpdateProgressModal';

const { Title, Paragraph, Text } = Typography;

export interface GoalDetailProps {
  /**
   * The goal to display
   */
  goal: Goal;

  /**
   * Callback when edit button is clicked
   */
  onEdit?: (goal: Goal) => void;

  /**
   * Callback when delete button is clicked
   */
  onDelete?: (goalId: string) => void;

  /**
   * Callback when progress is updated
   */
  onUpdateProgress?: (input: UpdateProgressInput) => void | Promise<void>;

  /**
   * Callback when favorite is toggled
   */
  onToggleFavorite?: (goalId: string) => void | Promise<void>;

  /**
   * Callback when archive is toggled
   */
  onToggleArchive?: (goalId: string) => void | Promise<void>;

  /**
   * Related goals to display
   */
  relatedGoals?: Goal[];

  /**
   * Loading state for delete operation
   */
  deleting?: boolean;

  /**
   * Loading state for progress update operation
   */
  updatingProgress?: boolean;
}

/**
 * Get progress status for Progress component
 */
const getProgressStatus = (progress: number): 'success' | 'exception' | 'active' | 'normal' => {
  if (progress >= 100) {
    return 'success';
  }
  if (progress < 50) {
    return 'exception';
  }
  return 'active';
};

/**
 * Format goal type for display
 */
const formatGoalType = (type: string): string => {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * GoalDetail Component
 */
export const GoalDetail: React.FC<GoalDetailProps> = ({
  goal,
  onEdit,
  onDelete,
  onUpdateProgress,
  onToggleFavorite,
  onToggleArchive,
  relatedGoals,
  deleting = false,
  updatingProgress = false,
}) => {
  const { t } = useTranslation();
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const progress = calculateProgress(goal);
  const progressStatus = getProgressStatus(progress);

  const handleDelete = () => {
    if (onDelete) {
      onDelete(goal.id);
    }
  };

  const handleToggleFavorite = () => {
    if (onToggleFavorite) {
      void onToggleFavorite(goal.id);
    }
  };

  const handleToggleArchive = () => {
    if (onToggleArchive) {
      void onToggleArchive(goal.id);
    }
  };

  const handleUpdateProgress = () => {
    setProgressModalOpen(true);
  };

  const handleProgressSubmit = async (input: UpdateProgressInput) => {
    if (onUpdateProgress) {
      await onUpdateProgress(input);
      setProgressModalOpen(false);
    }
  };

  // Calculate days until deadline
  const daysUntilDeadline = getDaysUntilDeadline(goal.deadline);

  return (
    <div>
      {/* Header Section with Progress */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={16}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Space align="start">
                  <Title level={2} style={{ margin: 0 }}>
                    {goal.title}
                  </Title>
                  {onToggleFavorite && (
                    <span
                      onClick={handleToggleFavorite}
                      style={{ cursor: 'pointer', fontSize: '20px', marginTop: '8px' }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleToggleFavorite();
                        }
                      }}
                    >
                      {goal.favorite ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                    </span>
                  )}
                </Space>
                {goal.description && (
                  <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>{goal.description}</Paragraph>
                )}
              </div>

              {/* Progress Section */}
              <div>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong>{t('goals.progress')}</Text>
                    <Text strong>{progress}%</Text>
                  </div>
                  <Progress percent={progress} status={progressStatus} format={() => formatProgress(goal)} />
                </Space>
              </div>

              {/* Deadline Section */}
              {goal.deadline && (
                <div>
                  <Space direction="vertical" size="small">
                    <Text strong>
                      {t('goals.dueDate')}: {formatDate(goal.deadline)}
                    </Text>
                    {isOverdue(goal.deadline) && <Tag color="red">{getDeadlineStatusText(goal.deadline)}</Tag>}
                    {isDueSoon(goal.deadline) && !isOverdue(goal.deadline) && (
                      <Tag color="orange">{getDeadlineStatusText(goal.deadline)}</Tag>
                    )}
                    {daysUntilDeadline !== null && daysUntilDeadline > 7 && (
                      <Tag color="blue">{t('goals.daysRemaining', { count: daysUntilDeadline })}</Tag>
                    )}
                  </Space>
                </div>
              )}

              {/* Action Buttons */}
              <Space wrap style={{ width: '100%' }}>
                {onUpdateProgress && (
                  <Button type="primary" icon={<RiseOutlined />} onClick={handleUpdateProgress}>
                    {t('goals.updateProgress')}
                  </Button>
                )}
                {onEdit && (
                  <Button icon={<EditOutlined />} onClick={() => onEdit(goal)}>
                    {t('goals.editGoal')}
                  </Button>
                )}
                {onToggleArchive && (
                  <Button icon={<InboxOutlined />} onClick={handleToggleArchive}>
                    {goal.archived ? t('goals.unarchive') : t('goals.archive')}
                  </Button>
                )}
                {onDelete && (
                  <Popconfirm
                    title={t('goals.deleteGoal')}
                    description={t('goals.deleteGoalConfirm')}
                    onConfirm={handleDelete}
                    okText={t('goals.yesDelete')}
                    cancelText={t('common.cancel')}
                    okButtonProps={{ danger: true }}
                  >
                    <Button danger icon={<DeleteOutlined />} loading={deleting}>
                      {t('goals.deleteGoal')}
                    </Button>
                  </Popconfirm>
                )}
              </Space>
            </Space>
          </Col>
          <Col xs={24} md={8}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* Quick Stats */}
              <Card size="small">
                <Statistic
                  title={t('goals.goalStatus')}
                  value={goal.status}
                  valueStyle={{ textTransform: 'capitalize' }}
                />
              </Card>
              <Card size="small">
                <Statistic
                  title={t('goals.priority')}
                  value={goal.priority}
                  valueStyle={{ textTransform: 'capitalize' }}
                />
              </Card>
              {goal.category && (
                <Card size="small">
                  <Statistic title={t('goals.categories')} value={goal.category} />
                </Card>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Basic Information */}
      <Card title={t('goals.detail.basicInfo')} style={{ marginBottom: 24 }}>
        <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered>
          <Descriptions.Item label={t('goals.goalType')}>
            <Tag>{formatGoalType(goal.type)}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('goals.goalStatus')}>
            <Tag color={getStatusColor(goal.status)}>{goal.status}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t('goals.priority')}>
            <Tag color={getPriorityColor(goal.priority)}>{goal.priority}</Tag>
          </Descriptions.Item>
          {goal.category && <Descriptions.Item label={t('goals.categories')}>{goal.category}</Descriptions.Item>}
          {goal.tags.length > 0 && (
            <Descriptions.Item label={t('goals.tags')}>
              <Space size="small" wrap>
                {goal.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </Space>
            </Descriptions.Item>
          )}
          {goal.startDate && (
            <Descriptions.Item label={t('goalDetail.startDate')}>{formatDate(goal.startDate)}</Descriptions.Item>
          )}
          {goal.deadline && (
            <Descriptions.Item label={t('goalDetail.deadline')}>{formatDate(goal.deadline)}</Descriptions.Item>
          )}
          {goal.completedDate && (
            <Descriptions.Item label={t('goalDetail.completedDate')}>
              {formatDate(goal.completedDate)}
            </Descriptions.Item>
          )}
          <Descriptions.Item label={t('goalDetail.created')}>{formatDate(goal.createdAt)}</Descriptions.Item>
          <Descriptions.Item label={t('goalDetail.lastUpdated')}>{formatDate(goal.updatedAt)}</Descriptions.Item>
          {goal.assignee && <Descriptions.Item label={t('goalDetail.assignee')}>{goal.assignee}</Descriptions.Item>}
          {goal.createdBy && <Descriptions.Item label={t('goalDetail.createdBy')}>{goal.createdBy}</Descriptions.Item>}
        </Descriptions>
      </Card>

      {/* Type-Specific Information */}
      {isQuantitativeGoal(goal) && (
        <Card title={t('goalDetail.quantitativeDetails')} style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Statistic title={t('goalDetail.startValue')} value={goal.startValue} suffix={goal.unit} />
            </Col>
            <Col xs={24} sm={8}>
              <Statistic title={t('goalDetail.currentValue')} value={goal.currentValue} suffix={goal.unit} />
            </Col>
            <Col xs={24} sm={8}>
              <Statistic title={t('goalDetail.targetValue')} value={goal.targetValue} suffix={goal.unit} />
            </Col>
          </Row>
          <Divider />
          <Descriptions column={{ xs: 1, sm: 2 }} bordered>
            <Descriptions.Item label={t('goalDetail.allowDecimals')}>
              {goal.allowDecimals ? t('goalDetail.yes') : t('goalDetail.no')}
            </Descriptions.Item>
            {goal.minValue !== undefined && (
              <Descriptions.Item label={t('goalDetail.minValue')}>{goal.minValue}</Descriptions.Item>
            )}
            {goal.maxValue !== undefined && (
              <Descriptions.Item label={t('goalDetail.maxValue')}>{goal.maxValue}</Descriptions.Item>
            )}
          </Descriptions>
        </Card>
      )}

      {isQualitativeGoal(goal) && (
        <Card title={t('goalDetail.qualitativeDetails')} style={{ marginBottom: 24 }}>
          <Descriptions column={{ xs: 1, sm: 2 }} bordered>
            <Descriptions.Item label={t('goalDetail.status')}>
              <Tag color={goal.qualitativeStatus === QualitativeStatus.COMPLETED ? 'green' : 'orange'}>
                {goal.qualitativeStatus.replace('_', ' ').toUpperCase()}
              </Tag>
            </Descriptions.Item>
            {goal.targetRating && (
              <Descriptions.Item label={t('goalDetail.targetRating')}>{goal.targetRating}/10</Descriptions.Item>
            )}
            {goal.selfAssessments && goal.selfAssessments.length > 0 && (
              <Descriptions.Item label={t('goalDetail.selfAssessments')} span={2}>
                <List
                  size="small"
                  dataSource={goal.selfAssessments}
                  renderItem={(assessment) => (
                    <List.Item>
                      <Space>
                        <Text strong>{t('goalDetail.rating', { rating: assessment.rating })}</Text>
                        <Text type="secondary">{formatDate(assessment.date)}</Text>
                        {assessment.comment && <Text>{assessment.comment}</Text>}
                      </Space>
                    </List.Item>
                  )}
                />
              </Descriptions.Item>
            )}
            {goal.improvementCriteria && goal.improvementCriteria.length > 0 && (
              <Descriptions.Item label={t('goalDetail.improvementCriteria')} span={2}>
                <List
                  size="small"
                  dataSource={goal.improvementCriteria}
                  renderItem={(criterion) => <List.Item>{criterion}</List.Item>}
                />
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>
      )}

      {isBinaryGoal(goal) && (
        <Card title={t('goalDetail.binaryDetails')} style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            {goal.targetCount !== undefined && (
              <>
                <Col xs={24} sm={12}>
                  <Statistic title={t('goalDetail.currentCount')} value={goal.currentCount} />
                </Col>
                <Col xs={24} sm={12}>
                  <Statistic title={t('goalDetail.targetCount')} value={goal.targetCount} />
                </Col>
              </>
            )}
          </Row>
          {goal.items && goal.items.length > 0 && (
            <>
              <Divider />
              <Title level={5}>{t('goalDetail.items')}</Title>
              <List
                dataSource={goal.items}
                renderItem={(item, index) => (
                  <List.Item>
                    <Space>
                      {index < goal.currentCount ? (
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      ) : (
                        <ClockCircleOutlined style={{ color: '#d9d9d9' }} />
                      )}
                      <Text>{item}</Text>
                    </Space>
                  </List.Item>
                )}
              />
            </>
          )}
          <Divider />
          <Descriptions column={{ xs: 1, sm: 2 }} bordered>
            <Descriptions.Item label={t('goalDetail.allowPartialCompletion')}>
              {goal.allowPartialCompletion ? t('goalDetail.yes') : t('goalDetail.no')}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {isMilestoneGoal(goal) && (
        <Card title={t('goalDetail.milestones')} style={{ marginBottom: 24 }}>
          {goal.milestones && goal.milestones.length > 0 ? (
            <Steps
              direction="vertical"
              current={goal.milestones.filter((m) => m.status === 'completed').length}
              items={goal.milestones
                .sort((a, b) => a.order - b.order)
                .map((milestone) => ({
                  title: milestone.title,
                  description: milestone.description,
                  status:
                    milestone.status === 'completed'
                      ? 'finish'
                      : milestone.status === 'in_progress'
                        ? 'process'
                        : milestone.status === 'skipped'
                          ? 'error'
                          : 'wait',
                  subTitle: milestone.dueDate ? formatDate(milestone.dueDate) : undefined,
                }))}
            />
          ) : (
            <Empty description={t('goalDetail.noMilestonesDefined')} />
          )}
        </Card>
      )}

      {isRecurringGoal(goal) && (
        <Card title={t('goalDetail.recurringDetails')} style={{ marginBottom: 24 }}>
          <Descriptions column={{ xs: 1, sm: 2 }} bordered>
            <Descriptions.Item label={t('goalDetail.frequency')}>
              {goal.recurrence.frequency} ({t('goalDetail.interval')} {goal.recurrence.interval})
            </Descriptions.Item>
            {goal.recurrence.endDate && (
              <Descriptions.Item label={t('goalDetail.endDate')}>
                {formatDate(goal.recurrence.endDate)}
              </Descriptions.Item>
            )}
            {goal.completionStats && (
              <>
                <Descriptions.Item label={t('goalDetail.totalOccurrences')}>
                  {goal.completionStats.totalOccurrences}
                </Descriptions.Item>
                <Descriptions.Item label={t('goalDetail.completedOccurrences')}>
                  {goal.completionStats.completedOccurrences}
                </Descriptions.Item>
                <Descriptions.Item label={t('goalDetail.completionRate')}>
                  {goal.completionStats.completionRate.toFixed(1)}%
                </Descriptions.Item>
                <Descriptions.Item label={t('goalDetail.currentStreak')}>
                  {goal.completionStats.streak.current}
                </Descriptions.Item>
                <Descriptions.Item label={t('goalDetail.longestStreak')}>
                  {goal.completionStats.streak.longest}
                </Descriptions.Item>
              </>
            )}
          </Descriptions>
        </Card>
      )}

      {isHabitGoal(goal) && (
        <Card title={t('goalDetail.habitDetails')} style={{ marginBottom: 24 }}>
          <Descriptions column={{ xs: 1, sm: 2 }} bordered>
            <Descriptions.Item label={t('goalDetail.targetFrequency')}>{goal.targetFrequency}</Descriptions.Item>
            {goal.habitStrength !== undefined && (
              <Descriptions.Item label={t('goalDetail.habitStrength')}>
                {goal.habitStrength.toFixed(1)}%
              </Descriptions.Item>
            )}
            {goal.completionStats && (
              <>
                <Descriptions.Item label={t('goalDetail.totalDays')}>
                  {goal.completionStats.totalOccurrences}
                </Descriptions.Item>
                <Descriptions.Item label={t('goalDetail.completedDays')}>
                  {goal.completionStats.completedOccurrences}
                </Descriptions.Item>
                <Descriptions.Item label={t('goalDetail.completionRate')}>
                  {goal.completionStats.completionRate.toFixed(1)}%
                </Descriptions.Item>
                <Descriptions.Item label={t('goalDetail.currentStreak')}>
                  {goal.completionStats.streak.current}
                </Descriptions.Item>
                <Descriptions.Item label={t('goalDetail.longestStreak')}>
                  {goal.completionStats.streak.longest}
                </Descriptions.Item>
              </>
            )}
          </Descriptions>
        </Card>
      )}

      {/* Notes Section */}
      {isFeatureEnabled('notes') && (
        <Card
          title={
            <Space>
              <FileTextOutlined />
              <span>{t('goalDetail.notes')}</span>
              {goal.notes.length > 0 && <Tag>{goal.notes.length}</Tag>}
            </Space>
          }
          style={{ marginBottom: 24 }}
        >
          {goal.notes && goal.notes.length > 0 ? (
            <Timeline
              items={goal.notes.map((note) => ({
                children: (
                  <div>
                    <Paragraph>{note.content}</Paragraph>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {formatDate(note.createdAt)}
                      {note.createdBy && ` by ${note.createdBy}`}
                    </Text>
                  </div>
                ),
              }))}
            />
          ) : (
            <Empty description={t('goalDetail.noNotesYet')} />
          )}
        </Card>
      )}

      {/* Attachments Section */}
      {isFeatureEnabled('attachments') && (
        <Card
          title={
            <Space>
              <PaperClipOutlined />
              <span>{t('goalDetail.attachments')}</span>
              {goal.attachments.length > 0 && <Tag>{goal.attachments.length}</Tag>}
            </Space>
          }
          style={{ marginBottom: 24 }}
        >
          {goal.attachments && goal.attachments.length > 0 ? (
            <List
              dataSource={goal.attachments}
              renderItem={(attachment) => (
                <List.Item>
                  <Space>
                    <PaperClipOutlined />
                    <Text>{attachment.filename}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {formatDate(attachment.uploadedAt)}
                    </Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      ({(attachment.size / 1024).toFixed(2)} KB)
                    </Text>
                  </Space>
                </List.Item>
              )}
            />
          ) : (
            <Empty description={t('goalDetail.noAttachmentsYet')} />
          )}
        </Card>
      )}

      {/* Progress History */}
      {goal.progressHistory && goal.progressHistory.length > 0 && (
        <Card title={t('goalDetail.progressHistory')} style={{ marginBottom: 24 }}>
          <Timeline
            items={goal.progressHistory
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 10)
              .map((entry) => ({
                children: (
                  <div>
                    <Space>
                      <Text strong>{entry.value}%</Text>
                      <Text type="secondary">{formatDate(entry.date)}</Text>
                    </Space>
                    {entry.note && <Paragraph style={{ marginTop: 4, marginBottom: 0 }}>{entry.note}</Paragraph>}
                  </div>
                ),
              }))}
          />
        </Card>
      )}

      {/* Related Goals */}
      {goal.relatedGoals && goal.relatedGoals.length > 0 && relatedGoals && relatedGoals.length > 0 && (
        <Card title={t('goalDetail.relatedGoals')} style={{ marginBottom: 24 }}>
          <List
            dataSource={relatedGoals}
            renderItem={(relatedGoal) => (
              <List.Item>
                <Space>
                  <Text strong>{relatedGoal.title}</Text>
                  <Tag color={getStatusColor(relatedGoal.status)}>{relatedGoal.status}</Tag>
                  <Text type="secondary">
                    {t('goalDetail.progress')}: {calculateProgress(relatedGoal)}%
                  </Text>
                </Space>
              </List.Item>
            )}
          />
        </Card>
      )}

      {/* Update Progress Modal */}
      {onUpdateProgress && (
        <UpdateProgressModal
          open={progressModalOpen}
          goal={goal}
          onCancel={() => setProgressModalOpen(false)}
          onSubmit={handleProgressSubmit}
          loading={updatingProgress}
        />
      )}
    </div>
  );
};
