/**
 * Goal Type Tooltips Utility
 *
 * Contains tooltip content for each goal type to help users understand
 * when to use each type and what examples apply.
 */

import { GoalType } from '../types';

export interface GoalTypeTooltipData {
  /** The goal type value */
  type: GoalType;
  /** Display name for the goal type */
  label: string;
  /** Brief description of the goal type */
  description: string;
  /** Concrete example of the goal type */
  example: string;
}

/**
 * Tooltip content for all goal types
 */
export const goalTypeTooltips: Record<GoalType, GoalTypeTooltipData> = {
  [GoalType.QUANTITATIVE]: {
    type: GoalType.QUANTITATIVE,
    label: 'Quantitative',
    description: 'Track numeric progress from a starting value to a target value.',
    example: 'Example: Running 100 miles, losing 10 kg, reading 20 books',
  },
  [GoalType.QUALITATIVE]: {
    type: GoalType.QUALITATIVE,
    label: 'Qualitative',
    description: 'Track progress using status levels. Best for subjective goals without clear numbers.',
    example: 'Example: Learning a new skill, completing a project phase',
  },
  [GoalType.BINARY]: {
    type: GoalType.BINARY,
    label: 'Binary',
    description: 'Simple done/not-done goals. Either complete or incomplete.',
    example: 'Example: Submit report, attend meeting, finish homework',
  },
  [GoalType.MILESTONE]: {
    type: GoalType.MILESTONE,
    label: 'Milestone',
    description: 'Break a large goal into smaller milestones. Track progress through each phase.',
    example: 'Example: Launch a product, complete a certification',
  },
  [GoalType.RECURRING]: {
    type: GoalType.RECURRING,
    label: 'Recurring',
    description: 'Goals that repeat on a regular schedule. Track completion over time.',
    example: 'Example: Weekly reports, monthly reviews, quarterly planning',
  },
  [GoalType.HABIT]: {
    type: GoalType.HABIT,
    label: 'Habit',
    description: 'Build daily habits with streak tracking. Track consistency over time.',
    example: 'Example: Exercise daily, meditate, read 30 minutes',
  },
};

/**
 * Get the full tooltip title (description + example) for a goal type
 */
export const getGoalTypeTooltipTitle = (type: GoalType): string => {
  const data = goalTypeTooltips[type];
  return `${data.description} ${data.example}`;
};

/**
 * Get the tooltip data for a specific goal type
 */
export const getGoalTypeTooltipData = (type: GoalType): GoalTypeTooltipData => {
  return goalTypeTooltips[type];
};
