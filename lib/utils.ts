import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Core utility - keep this here as it's widely used
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Export everything from shared/utils for consistency
export * from './shared/utils';
