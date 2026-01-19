import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date to a relative time string (e.g., "2 min ago")
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffSeconds < 60) {
    return 'just now';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  if (diffHours < 24) {
    return `${diffHours} hr ago`;
  }

  return date.toLocaleDateString('en-NZ', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format a number with appropriate suffixes (e.g., 1.2k)
 */
export function formatNumber(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
}

/**
 * Get the current hour start for aggregation purposes
 */
export function getHourStart(date: Date = new Date()): Date {
  const hourStart = new Date(date);
  hourStart.setMinutes(0, 0, 0);
  return hourStart;
}

/**
 * Get the day of week name
 */
export function getDayName(dayIndex: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayIndex] || 'Unknown';
}

/**
 * Convert 24-hour format to 12-hour format with AM/PM
 */
export function formatHour(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}

/**
 * Calculate a weighted moving average
 */
export function weightedMovingAverage(values: number[], weights: number[]): number {
  if (values.length !== weights.length || values.length === 0) {
    return 0;
  }

  const weightedSum = values.reduce((sum, val, i) => sum + val * weights[i], 0);
  const weightSum = weights.reduce((sum, w) => sum + w, 0);

  return weightSum > 0 ? weightedSum / weightSum : 0;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generate NZ timezone aware date
 */
export function getNZTime(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Pacific/Auckland' }));
}
