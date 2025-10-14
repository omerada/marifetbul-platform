// ================================================
// THEME TOGGLE COMPONENT - EXAMPLE USAGE
// ================================================
// Demonstrates using the type-safe theme store

'use client';

import {
  useThemeStore,
  themeSelectors,
  type Theme,
  type ColorScheme,
} from '@/lib/core/store/domains/theme/themeStore';
import { Moon, Sun, Monitor } from 'lucide-react';

/**
 * Theme toggle component with icon buttons
 * Demonstrates selector usage for optimized re-renders
 */
export function ThemeToggle() {
  // ✅ Type-safe selectors - only re-renders when theme changes
  const theme = themeSelectors.useTheme();
  const { setTheme } = themeSelectors.useActions();

  const themes: {
    value: Theme;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
  }[] = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ];

  return (
    <div className="flex items-center gap-2 rounded-lg border border-gray-200 p-1">
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`flex items-center gap-2 rounded px-3 py-2 text-sm font-medium transition-colors ${
            theme === value
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-600 hover:bg-gray-100'
          } `}
          aria-label={`Switch to ${label} theme`}
          aria-pressed={theme === value}
        >
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}

/**
 * Color scheme selector
 * Demonstrates full store access
 */
export function ColorSchemeSelector() {
  // ✅ Direct store access (re-renders on any state change)
  const { colorScheme, setColorScheme } = useThemeStore();

  const schemes: { value: ColorScheme; label: string; color: string }[] = [
    { value: 'default', label: 'Default', color: 'gray' },
    { value: 'blue', label: 'Blue', color: 'blue' },
    { value: 'green', label: 'Green', color: 'green' },
    { value: 'purple', label: 'Purple', color: 'purple' },
  ];

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Color Scheme</label>
      <div className="flex gap-2">
        {schemes.map(({ value, label, color }) => (
          <button
            key={value}
            onClick={() => setColorScheme(value)}
            className={`h-10 w-10 rounded-full border-2 transition-all ${
              colorScheme === value
                ? `border-${color}-500 ring-2 ring-${color}-200`
                : 'border-gray-300 hover:border-gray-400'
            } bg-${color}-500 `}
            aria-label={`Select ${label} color scheme`}
            aria-pressed={colorScheme === value}
            title={label}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Theme status display
 * Demonstrates computed state usage
 */
export function ThemeStatus() {
  // ✅ Multiple selectors - only re-renders when these specific values change
  const theme = themeSelectors.useTheme();
  const colorScheme = themeSelectors.useColorScheme();
  const effectiveTheme = themeSelectors.useEffectiveTheme();

  return (
    <div className="rounded-lg border border-gray-200 p-4 text-sm">
      <h3 className="font-medium text-gray-900">Theme Settings</h3>
      <dl className="mt-2 space-y-1">
        <div className="flex justify-between">
          <dt className="text-gray-600">Selected:</dt>
          <dd className="font-medium capitalize">{theme}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-600">Active:</dt>
          <dd className="font-medium capitalize">{effectiveTheme}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-600">Color:</dt>
          <dd className="font-medium capitalize">{colorScheme}</dd>
        </div>
      </dl>
    </div>
  );
}

/**
 * Complete theme settings panel
 * Combines all theme components
 */
export function ThemeSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Appearance Settings
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Customize the look and feel of your application
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="mb-3 text-sm font-medium text-gray-700">Theme Mode</h3>
          <ThemeToggle />
        </div>

        <ColorSchemeSelector />

        <ThemeStatus />
      </div>
    </div>
  );
}
