/**
 * Goals Feature - Validation Utilities
 *
 * This file provides validation utilities for goal-related data structures.
 * It re-exports Zod schemas from the specifications and provides helper functions
 * for validation, error handling, and Ant Design Form integration.
 *
 * Architecture Decision:
 * - Validation schemas are defined in `@specs/validation/goal.schemas.ts` as the authoritative source
 * - This file provides a convenience layer for validation operations
 * - Supports both programmatic validation and Ant Design Form integration
 *
 * Usage:
 *   import { validateGoal, safeValidateGoal, zodToAntdErrors } from '@/features/goals/utils/validation';
 *   import { GoalSchema, CreateGoalInputSchema } from '@/features/goals/utils/validation';
 */

import { z } from 'zod';
import type { FormInstance } from 'antd';

// Import schemas and types for use in this file
import {
  // Schemas
  GoalSchema,
  CreateGoalInputSchema,
  UpdateGoalInputSchema,
  GoalFiltersSchema,
  UpdateProgressInputSchema,
  // Types
  type Goal,
  type CreateGoalInput,
  type UpdateGoalInput,
  type GoalFilters,
  type UpdateProgressInput,
} from '@specs/validation/goal.schemas';

// Re-export all schemas from specs
export {
  // Enums
  GoalTypeSchema,
  GoalStatusSchema,
  PrioritySchema,
  RecurrenceFrequencySchema,
  QualitativeStatusSchema,
  // Nested Schemas
  RecurrenceSchema,
  MilestoneSchema,
  ProgressEntrySchema,
  NoteSchema,
  AttachmentSchema,
  SelfAssessmentSchema,
  HabitEntrySchema,
  StreakSchema,
  CompletionStatsSchema,
  // Goal Type Schemas
  QuantitativeGoalSchema,
  QualitativeGoalSchema,
  BinaryGoalSchema,
  MilestoneGoalSchema,
  RecurringGoalSchema,
  HabitGoalSchema,
  // Main Schemas
  GoalSchema,
  CreateGoalInputSchema,
  UpdateGoalInputSchema,
  GoalFiltersSchema,
  GoalSortOptionsSchema,
  // Progress Schemas
  UpdateProgressInputSchema,
  UpdateQuantitativeValueSchema,
  // Types (inferred from schemas)
  type GoalType,
  type GoalStatus,
  type Priority,
  type Recurrence,
  type Milestone,
  type ProgressEntry,
  type Note,
  type Attachment,
  type SelfAssessment,
  type HabitEntry,
  type Streak,
  type CompletionStats,
  type Goal,
  type CreateGoalInput,
  type UpdateGoalInput,
  type GoalFilters,
  type GoalSortOptions,
  type UpdateProgressInput,
  type UpdateQuantitativeValue,
} from '@specs/validation/goal.schemas';

// ============================================================================
// Validation Helper Functions
// ============================================================================

/**
 * Validates a goal and throws if invalid
 * @param data - The data to validate
 * @returns The validated goal
 * @throws {z.ZodError} If validation fails
 */
export function validateGoal(data: unknown): Goal {
  return GoalSchema.parse(data);
}

/**
 * Safely validates a goal without throwing
 * @param data - The data to validate
 * @returns Validation result with success flag and data/error
 */
export function safeValidateGoal(data: unknown): {
  success: boolean;
  data?: Goal;
  error?: z.ZodError;
} {
  const result = GoalSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

/**
 * Validates a create goal input
 * @param data - The data to validate
 * @returns The validated create goal input
 * @throws {z.ZodError} If validation fails
 */
export function validateCreateGoalInput(data: unknown): CreateGoalInput {
  return CreateGoalInputSchema.parse(data);
}

/**
 * Safely validates a create goal input without throwing
 * @param data - The data to validate
 * @returns Validation result with success flag and data/error
 */
export function safeValidateCreateGoalInput(data: unknown): {
  success: boolean;
  data?: CreateGoalInput;
  error?: z.ZodError;
} {
  const result = CreateGoalInputSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

/**
 * Validates an update goal input
 * @param data - The data to validate
 * @returns The validated update goal input
 * @throws {z.ZodError} If validation fails
 */
export function validateUpdateGoalInput(data: unknown): UpdateGoalInput {
  return UpdateGoalInputSchema.parse(data);
}

/**
 * Safely validates an update goal input without throwing
 * @param data - The data to validate
 * @returns Validation result with success flag and data/error
 */
export function safeValidateUpdateGoalInput(data: unknown): {
  success: boolean;
  data?: UpdateGoalInput;
  error?: z.ZodError;
} {
  const result = UpdateGoalInputSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

/**
 * Validates goal filters
 * @param data - The data to validate
 * @returns The validated goal filters
 * @throws {z.ZodError} If validation fails
 */
export function validateGoalFilters(data: unknown): GoalFilters {
  return GoalFiltersSchema.parse(data);
}

/**
 * Safely validates goal filters without throwing
 * @param data - The data to validate
 * @returns Validation result with success flag and data/error
 */
export function safeValidateGoalFilters(data: unknown): {
  success: boolean;
  data?: GoalFilters;
  error?: z.ZodError;
} {
  const result = GoalFiltersSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

/**
 * Validates a progress update input
 * @param data - The data to validate
 * @returns The validated progress update input
 * @throws {z.ZodError} If validation fails
 */
export function validateUpdateProgressInput(data: unknown): UpdateProgressInput {
  return UpdateProgressInputSchema.parse(data);
}

/**
 * Safely validates a progress update input without throwing
 * @param data - The data to validate
 * @returns Validation result with success flag and data/error
 */
export function safeValidateUpdateProgressInput(data: unknown): {
  success: boolean;
  data?: UpdateProgressInput;
  error?: z.ZodError;
} {
  const result = UpdateProgressInputSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

// ============================================================================
// Error Handling Utilities
// ============================================================================

/**
 * Converts a Zod error to a field error map
 * @param error - The Zod error to convert
 * @returns A map of field paths to error messages
 */
export function zodErrorToFieldErrors(error: z.ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};

  error.errors.forEach((issue) => {
    const path = issue.path.join('.');
    if (!fieldErrors[path]) {
      fieldErrors[path] = [];
    }
    // TypeScript knows fieldErrors[path] is defined after the check above
    const errors = fieldErrors[path];
    if (errors) {
      errors.push(issue.message);
    }
  });

  return fieldErrors;
}

/**
 * Gets the first error message for a field from a Zod error
 * @param error - The Zod error
 * @param fieldPath - The field path (e.g., 'title' or 'milestones.0.title')
 * @returns The first error message for the field, or undefined if not found
 */
export function getFieldError(error: z.ZodError, fieldPath: string): string | undefined {
  const fieldErrors = zodErrorToFieldErrors(error);
  return fieldErrors[fieldPath]?.[0];
}

/**
 * Gets all error messages for a field from a Zod error
 * @param error - The Zod error
 * @param fieldPath - The field path (e.g., 'title' or 'milestones.0.title')
 * @returns Array of error messages for the field, or empty array if not found
 */
export function getFieldErrors(error: z.ZodError, fieldPath: string): string[] {
  const fieldErrors = zodErrorToFieldErrors(error);
  return fieldErrors[fieldPath] || [];
}

/**
 * Formats a Zod error into a user-friendly message
 * @param error - The Zod error to format
 * @returns A formatted error message
 */
export function formatZodError(error: z.ZodError): string {
  if (error.errors.length === 0) {
    return 'Validation failed';
  }

  if (error.errors.length === 1) {
    const issue = error.errors[0];
    if (issue) {
      const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
      return `${path}${issue.message}`;
    }
  }

  return `Validation failed with ${error.errors.length} errors`;
}

// ============================================================================
// Ant Design Form Integration
// ============================================================================

/**
 * Converts Zod errors to Ant Design Form field errors
 * @param error - The Zod error to convert
 * @returns Array of Ant Design Form field error objects
 */
export function zodToAntdErrors(error: z.ZodError): Array<{
  name: (string | number)[];
  errors: string[];
}> {
  const fieldErrors: Record<string, string[]> = zodErrorToFieldErrors(error);

  return Object.entries(fieldErrors).map(([path, errors]) => ({
    name: path.split('.').map((segment) => {
      // Handle array indices
      const num = Number(segment);
      return isNaN(num) ? segment : num;
    }),
    errors,
  }));
}

/**
 * Applies Zod validation errors to an Ant Design Form instance
 * @param form - The Ant Design Form instance
 * @param error - The Zod error to apply
 */
export function applyZodErrorsToForm(form: FormInstance, error: z.ZodError): void {
  const fieldErrors = zodToAntdErrors(error);
  form.setFields(fieldErrors);
}

/**
 * Creates an Ant Design Form validator from a Zod schema
 * @param schema - The Zod schema to use for validation
 * @returns An Ant Design Form validator function
 */
export function zodValidator<T extends z.ZodTypeAny>(
  schema: T
): (_: unknown, value: unknown) => Promise<void> {
  return async (_, value) => {
    const result = schema.safeParse(value);
    if (!result.success) {
      const firstError = result.error.errors[0];
      if (firstError) {
        throw new Error(firstError.message);
      }
      throw new Error('Validation failed');
    }
  };
}

/**
 * Creates an Ant Design Form validator for a specific field using a Zod schema
 * @param schema - The Zod schema to use for validation
 * @param fieldName - The name of the field being validated
 * @returns An Ant Design Form validator function
 */
export function zodFieldValidator<T extends z.ZodTypeAny>(
  schema: T,
  fieldName: string
): (_: unknown, value: unknown) => Promise<void> {
  return async (_, value) => {
    const result = schema.safeParse(value);
    if (!result.success) {
      const fieldError = result.error.errors.find((e) => e.path.includes(fieldName));
      if (fieldError) {
        throw new Error(fieldError.message);
      }
      // If no specific field error, use the first error
      const firstError = result.error.errors[0];
      if (firstError) {
        throw new Error(firstError.message);
      }
      throw new Error('Validation failed');
    }
  };
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if data is a valid goal
 * @param data - The data to check
 * @returns True if data is a valid goal
 */
export function isValidGoal(data: unknown): data is Goal {
  return GoalSchema.safeParse(data).success;
}

/**
 * Type guard to check if data is a valid create goal input
 * @param data - The data to check
 * @returns True if data is a valid create goal input
 */
export function isValidCreateGoalInput(data: unknown): data is CreateGoalInput {
  return CreateGoalInputSchema.safeParse(data).success;
}

/**
 * Type guard to check if data is a valid update goal input
 * @param data - The data to check
 * @returns True if data is a valid update goal input
 */
export function isValidUpdateGoalInput(data: unknown): data is UpdateGoalInput {
  return UpdateGoalInputSchema.safeParse(data).success;
}

