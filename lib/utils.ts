import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Core utility - keep this here as it's widely used
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Export everything from utils/index.ts to avoid circular imports
export * from './utils/index';
