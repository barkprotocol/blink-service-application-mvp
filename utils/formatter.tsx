import { format, formatDistanceToNow } from 'date-fns';
import { DEFAULT_CURRENCY, DATE_FORMAT } from './constants';

/**
 * Format a date to a string
 * @param date The date to format
 * @param formatString The format string to use (default: DATE_FORMAT from constants)
 * @returns The formatted date string
 */
export function formatDate(date: Date | number, formatString: string = DATE_FORMAT): string {
  return format(date, formatString);
}

/**
 * Format a date to a relative time string (e.g., "2 days ago")
 * @param date The date to format
 * @returns The relative time string
 */
export function formatRelativeTime(date: Date | number): string {
  return formatDistanceToNow(date, { addSuffix: true });
}

/**
 * Format a number as currency
 * @param amount The amount to format
 * @param currency The currency to use (default: DEFAULT_CURRENCY from constants)
 * @returns The formatted currency string
 */
export function formatCurrency(amount: number, currency: string = DEFAULT_CURRENCY): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(amount);
}

/**
 * Format a number as a percentage
 * @param value The value to format as a percentage
 * @param decimalPlaces The number of decimal places to show (default: 2)
 * @returns The formatted percentage string
 */
export function formatPercentage(value: number, decimalPlaces: number = 2): string {
  return `${(value * 100).toFixed(decimalPlaces)}%`;
}

/**
 * Truncate a string to a specified length
 * @param str The string to truncate
 * @param maxLength The maximum length of the string
 * @returns The truncated string
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 3)}...`;
}

/**
 * Format a Solana address for display
 * @param address The Solana address to format
 * @param prefixLength The number of characters to show at the start (default: 4)
 * @param suffixLength The number of characters to show at the end (default: 4)
 * @returns The formatted address string
 */
export function formatAddress(address: string, prefixLength: number = 4, suffixLength: number = 4): string {
  if (address.length <= prefixLength + suffixLength) return address;
  return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
}

/**
 * Format a file size in bytes to a human-readable string
 * @param bytes The file size in bytes
 * @returns The formatted file size string
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Format a number with commas as thousand separators
 * @param number The number to format
 * @returns The formatted number string
 */
export function formatNumber(number: number): string {
  return number.toLocaleString('en-US');
}

/**
 * Capitalize the first letter of a string
 * @param str The string to capitalize
 * @returns The capitalized string
 */
export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format a duration in milliseconds to a human-readable string
 * @param milliseconds The duration in milliseconds
 * @returns The formatted duration string
 */
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

