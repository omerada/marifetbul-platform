import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Core utility - keep this here as it's widely used
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// CATEGORIZED UTILITIES - USE BARREL EXPORTS
export * from './utils/date';
export * from './utils/format';
export * from './utils/async';
export * from './utils/validation';
export * from './utils/auth';
export * from './utils/lazy-loading';

// Legacy exports for backward compatibility
export { formatDate, formatRelativeTime } from './utils/date';
export { slugify, truncateText } from './utils/format';
export { debounce, debounceAsync, throttle } from './utils/async';
