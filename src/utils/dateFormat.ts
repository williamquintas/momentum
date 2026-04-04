/**
 * Date/Time Formatting Utilities
 *
 * Provides locale-aware date and time formatting using date-fns.
 */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import {
  format,
  formatDistanceToNow,
  isToday,
  isYesterday,
  isTomorrow,
  isThisWeek,
  isThisMonth,
  type Locale,
} from 'date-fns';
import { enUS, es, ptBR } from 'date-fns/locale';

import i18n from '@/i18n';

/**
 * Map of i18n language codes to date-fns locales
 */
const localeMap: Record<string, Locale> = {
  en: enUS,
  es: es,
  'pt-br': ptBR,
};

/**
 * Gets the current locale for date-fns based on i18n language
 * @returns The date-fns locale object
 */
const getDateFnsLocale = (): Locale => {
  const lang = i18n.language || 'en';
  return localeMap[lang] || enUS;
};

/**
 * Formats a date using locale-aware formatting
 * @param date - Date to format
 * @param formatString - Format pattern (default: 'PP')
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string | number, formatString = 'PP'): string => {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return format(dateObj, formatString, { locale: getDateFnsLocale() });
};

/**
 * Formats a time using locale-aware formatting
 * @param date - Date to format
 * @param formatString - Format pattern (default: 'p')
 * @returns Formatted time string
 */
export const formatTime = (date: Date | string | number, formatString = 'p'): string => {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return format(dateObj, formatString, { locale: getDateFnsLocale() });
};

/**
 * Formats a date and time using locale-aware formatting
 * @param date - Date to format
 * @param formatString - Format pattern (default: 'PP p')
 * @returns Formatted date/time string
 */
export const formatDateTime = (date: Date | string | number, formatString = 'PP p'): string => {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return format(dateObj, formatString, { locale: getDateFnsLocale() });
};

/**
 * Returns a relative time string (e.g., "2 days ago", "in 3 hours")
 * @param date - Date to compare
 * @param addSuffix - Whether to add suffix like "ago" or "in" (default: true)
 * @returns Relative time string
 */
export const formatRelativeTime = (date: Date | string | number, addSuffix = true): string => {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix, locale: getDateFnsLocale() });
};

/**
 * Returns a human-readable relative date (Today, Yesterday, Tomorrow, etc.)
 * @param date - Date to check
 * @returns Human-readable relative date string
 */
export const getRelativeDateLabel = (date: Date | string | number): string => {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

  if (isToday(dateObj)) {
    return i18n.t('time.today');
  }
  if (isYesterday(dateObj)) {
    return i18n.t('time.yesterday');
  }
  if (isTomorrow(dateObj)) {
    return i18n.t('time.tomorrow');
  }
  if (isThisWeek(dateObj)) {
    return i18n.t('time.thisWeek');
  }
  if (isThisMonth(dateObj)) {
    return i18n.t('time.thisMonth');
  }

  return formatDate(dateObj);
};

/**
 * Formats a short date (e.g., "Jan 15")
 * @param date - Date to format
 * @returns Short formatted date
 */
export const formatShortDate = (date: Date | string | number): string => {
  return formatDate(date, 'MMM d');
};

/**
 * Formats a full date (e.g., "January 15, 2024")
 * @param date - Date to format
 * @returns Full formatted date
 */
export const formatFullDate = (date: Date | string | number): string => {
  return formatDate(date, 'MMMM d, yyyy');
};

/**
 * Formats a numeric date (e.g., "01/15/2024" or "15/01/2024")
 * @param date - Date to format
 * @returns Numeric formatted date
 */
export const formatNumericDate = (date: Date | string | number): string => {
  return formatDate(date, 'P');
};
