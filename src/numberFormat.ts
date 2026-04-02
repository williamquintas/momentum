/**
 * Number Formatting Utilities
 *
 * Provides locale-aware number, currency, and percentage formatting.
 */

import i18n from './i18n';

/**
 * Gets the Intl locale code based on i18n language
 * @returns The Intl locale string
 */
const getIntlLocale = (): string => {
  const lang = i18n.language || 'en';
  const localeMap: Record<string, string> = {
    en: 'en-US',
    es: 'es-ES',
    'pt-br': 'pt-BR',
  };
  return localeMap[lang] || 'en-US';
};

/**
 * Formats a number with locale-specific separators
 * @param value - Number to format
 * @param opts - Intl.NumberFormat options
 * @returns Formatted number string
 */
export const formatNumber = (value: number, opts?: Intl.NumberFormatOptions): string => {
  return new Intl.NumberFormat(getIntlLocale(), opts).format(value);
};

/**
 * Formats a number as currency
 * @param value - Amount to format
 * @param currency - Currency code (default: 'USD')
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number, currency = 'USD'): string => {
  return new Intl.NumberFormat(getIntlLocale(), {
    style: 'currency',
    currency,
  }).format(value);
};

/**
 * Formats a number as a percentage
 * @param value - Number to format as percentage (0-1 or 0-100)
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted percentage string
 */
export const formatPercent = (value: number, decimals = 0): string => {
  return new Intl.NumberFormat(getIntlLocale(), {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Formats a number with compact notation (e.g., 1K, 1M)
 * @param value - Number to format
 * @returns Compact formatted number
 */
export const formatCompactNumber = (value: number): string => {
  return new Intl.NumberFormat(getIntlLocale(), {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(value);
};

/**
 * Formats a decimal number with specified precision
 * @param value - Number to format
 * @param minFrac - Minimum decimal places
 * @param maxFrac - Maximum decimal places
 * @returns Formatted decimal string
 */
export const formatDecimal = (value: number, minFrac = 0, maxFrac = 2): string => {
  return new Intl.NumberFormat(getIntlLocale(), {
    minimumFractionDigits: minFrac,
    maximumFractionDigits: maxFrac,
  }).format(value);
};

/**
 * Formats a number with thousands separators
 * @param value - Number to format
 * @returns Formatted number with separators
 */
export const formatWithSeparators = (value: number): string => {
  return new Intl.NumberFormat(getIntlLocale(), {
    useGrouping: true,
  }).format(value);
};

/**
 * Formats a unit value (e.g., "5 km", "10 kg")
 * @param value - Numeric value
 * @param unit - Unit to display
 * @returns Formatted unit string
 */
export const formatUnit = (value: number, unit: string): string => {
  return new Intl.NumberFormat(getIntlLocale(), {
    style: 'unit',
    unit,
  }).format(value);
};
