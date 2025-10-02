'use client';

import React from 'react';
import { useTheme } from '@/hooks/shared/useTheme';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  variant?: 'button' | 'switch' | 'icon';
  size?: 'sm' | 'md' | 'lg';
}

export function ThemeToggle({
  className,
  variant = 'button',
  size = 'md',
}: ThemeToggleProps) {
  const { isDarkMode, toggleTheme, themeLabel } = useTheme();

  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={toggleTheme}
        className={cn(
          'border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground focus:ring-ring inline-flex items-center justify-center rounded-lg border transition-all focus:ring-2 focus:ring-offset-2 focus:outline-none',
          sizeClasses[size],
          className
        )}
        aria-label={themeLabel}
      >
        {isDarkMode ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>
    );
  }

  if (variant === 'switch') {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <span className="text-muted-foreground text-sm">
          {isDarkMode ? 'Dark' : 'Light'}
        </span>
        <button
          onClick={toggleTheme}
          className={cn(
            'focus:ring-ring relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none',
            isDarkMode ? 'bg-primary' : 'bg-input'
          )}
        >
          <span
            className={cn(
              'bg-background inline-block h-4 w-4 transform rounded-full transition-transform',
              isDarkMode ? 'translate-x-6' : 'translate-x-1'
            )}
          />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground focus:ring-ring inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition-all focus:ring-2 focus:ring-offset-2 focus:outline-none',
        className
      )}
    >
      <span className="mr-2">
        {isDarkMode ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </span>
      {themeLabel}
    </button>
  );
}
