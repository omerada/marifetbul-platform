'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import { cn } from '@/lib/utils';

// Accessibility context types
interface AccessibilityConfig {
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  focusVisible: boolean;
  announcements: boolean;
  keyboardNavigation: boolean;
}

interface AccessibilityContextType {
  config: AccessibilityConfig;
  updateConfig: (updates: Partial<AccessibilityConfig>) => void;
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  manageFocus: (element: HTMLElement | null) => void;
  trapFocus: (container: HTMLElement | null) => () => void;
  isKeyboardUser: boolean;
}

// Default accessibility configuration
const defaultConfig: AccessibilityConfig = {
  reducedMotion: false,
  highContrast: false,
  largeText: false,
  focusVisible: true,
  announcements: true,
  keyboardNavigation: true,
};

// Context
const AccessibilityContext = createContext<AccessibilityContextType | null>(
  null
);

// Enhanced Accessibility Provider
export function AccessibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [config, setConfig] = useState<AccessibilityConfig>(defaultConfig);
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);
  const announcementRef = useRef<HTMLDivElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  // Detect user preferences from system
  useEffect(() => {
    const mediaQueries = {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
      highContrast: window.matchMedia('(prefers-contrast: high)'),
      largeText: window.matchMedia('(prefers-text-size: large)'),
    };

    const updateFromSystem = () => {
      setConfig((prev) => ({
        ...prev,
        reducedMotion: mediaQueries.reducedMotion.matches,
        highContrast: mediaQueries.highContrast.matches,
        largeText: mediaQueries.largeText.matches,
      }));
    };

    // Initial check
    updateFromSystem();

    // Listen for changes
    Object.values(mediaQueries).forEach((mq) => {
      mq.addEventListener('change', updateFromSystem);
    });

    return () => {
      Object.values(mediaQueries).forEach((mq) => {
        mq.removeEventListener('change', updateFromSystem);
      });
    };
  }, []);

  // Detect keyboard users
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsKeyboardUser(true);
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardUser(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Apply accessibility styles to document
  useEffect(() => {
    const root = document.documentElement;

    // Apply CSS custom properties for accessibility
    root.style.setProperty('--motion-scale', config.reducedMotion ? '0' : '1');
    root.style.setProperty('--text-scale', config.largeText ? '1.2' : '1');

    // High contrast mode
    if (config.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Keyboard navigation visibility
    if (isKeyboardUser && config.focusVisible) {
      root.classList.add('keyboard-user');
    } else {
      root.classList.remove('keyboard-user');
    }

    return () => {
      root.classList.remove('high-contrast', 'keyboard-user');
    };
  }, [config, isKeyboardUser]);

  // Update configuration
  const updateConfig = useCallback((updates: Partial<AccessibilityConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  // Screen reader announcements
  const announce = useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      if (!config.announcements || !announcementRef.current) return;

      const announcement = document.createElement('div');
      announcement.textContent = message;
      announcement.setAttribute('aria-live', priority);
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';

      announcementRef.current.appendChild(announcement);

      // Clean up after announcement
      setTimeout(() => {
        if (announcementRef.current?.contains(announcement)) {
          announcementRef.current.removeChild(announcement);
        }
      }, 1000);
    },
    [config.announcements]
  );

  // Focus management
  const manageFocus = useCallback(
    (element: HTMLElement | null) => {
      if (!element || !config.keyboardNavigation) return;

      // Store last focused element
      lastFocusedRef.current = document.activeElement as HTMLElement;

      // Focus the target element
      element.focus();

      // If element can't receive focus, try to find focusable child
      if (document.activeElement !== element) {
        const focusable = element.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement;

        if (focusable) {
          focusable.focus();
        }
      }
    },
    [config.keyboardNavigation]
  );

  // Focus trap for modals and dialogs
  const trapFocus = useCallback(
    (container: HTMLElement | null) => {
      if (!container || !config.keyboardNavigation) {
        return () => {};
      }

      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      const firstFocusable = focusableElements[0] as HTMLElement;
      const lastFocusable = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
          }
        }
      };

      // Focus first element
      if (firstFocusable) {
        firstFocusable.focus();
      }

      container.addEventListener('keydown', handleTabKey);

      // Return cleanup function
      return () => {
        container.removeEventListener('keydown', handleTabKey);

        // Restore focus to last focused element
        if (lastFocusedRef.current) {
          lastFocusedRef.current.focus();
          lastFocusedRef.current = null;
        }
      };
    },
    [config.keyboardNavigation]
  );

  const contextValue: AccessibilityContextType = {
    config,
    updateConfig,
    announce,
    manageFocus,
    trapFocus,
    isKeyboardUser,
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}

      {/* Screen reader announcement region */}
      <div
        ref={announcementRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />
    </AccessibilityContext.Provider>
  );
}

// Hook to use accessibility context
export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error(
      'useAccessibility must be used within AccessibilityProvider'
    );
  }
  return context;
}

// Enhanced Button with accessibility features
interface AccessibleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  announceLabel?: string;
  describedBy?: string;
}

export function AccessibleButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  announceLabel,
  describedBy,
  children,
  className,
  onClick,
  disabled,
  ...props
}: AccessibleButtonProps) {
  const { config, announce, isKeyboardUser } = useAccessibility();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (announceLabel && config.announcements) {
      announce(announceLabel);
    }
    onClick?.(e);
  };

  const baseClasses = cn(
    'inline-flex items-center justify-center font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'rounded-md',
    // Enhanced focus for keyboard users
    isKeyboardUser && 'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    // High contrast adjustments
    config.highContrast && 'border-2 border-current'
  );

  const variantClasses = {
    primary: cn(
      'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
      config.highContrast && 'bg-blue-800 hover:bg-blue-900'
    ),
    secondary: cn(
      'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-500',
      config.highContrast && 'bg-gray-200 text-black hover:bg-gray-300'
    ),
    outline: cn(
      'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus-visible:ring-blue-500',
      config.highContrast && 'border-gray-900 text-black hover:bg-gray-100'
    ),
    ghost: cn(
      'text-gray-700 hover:bg-gray-100 focus-visible:ring-blue-500',
      config.highContrast && 'text-black hover:bg-gray-200'
    ),
    danger: cn(
      'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
      config.highContrast && 'bg-red-800 hover:bg-red-900'
    ),
  };

  const sizeClasses = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-8 text-base',
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      onClick={handleClick}
      aria-describedby={describedBy}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {leftIcon && !loading && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
}

// Skip Link component
interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
}

export function SkipLink({ href, children }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        'absolute top-auto left-[-9999px] h-[1px] w-[1px] overflow-hidden',
        'focus:top-2 focus:left-2 focus:h-auto focus:w-auto focus:overflow-visible',
        'z-50 rounded-md bg-blue-600 px-4 py-2 text-white',
        'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
      )}
    >
      {children}
    </a>
  );
}

// Landmark component for page regions
interface LandmarkProps {
  role:
    | 'banner'
    | 'navigation'
    | 'main'
    | 'complementary'
    | 'contentinfo'
    | 'search';
  label?: string;
  children: React.ReactNode;
  className?: string;
}

export function Landmark({ role, label, children, className }: LandmarkProps) {
  return (
    <div role={role} aria-label={label} className={className}>
      {children}
    </div>
  );
}

// Heading component with proper hierarchy
interface AccessibleHeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function AccessibleHeading({
  level,
  children,
  className,
  id,
}: AccessibleHeadingProps) {
  const { config } = useAccessibility();

  const headingClasses = cn(
    'font-semibold',
    {
      'text-3xl': level === 1,
      'text-2xl': level === 2,
      'text-xl': level === 3,
      'text-lg': level === 4,
      'text-base': level === 5,
      'text-sm': level === 6,
    },
    config.largeText && {
      'text-4xl': level === 1,
      'text-3xl': level === 2,
      'text-2xl': level === 3,
      'text-xl': level === 4,
      'text-lg': level === 5,
      'text-base': level === 6,
    },
    config.highContrast && 'text-black',
    className
  );

  // Use React.createElement to dynamically create heading elements
  return React.createElement(
    `h${level}`,
    { id, className: headingClasses },
    children
  );
}

// Focus management hook
export function useFocusManagement() {
  const { manageFocus, trapFocus } = useAccessibility();

  return {
    manageFocus,
    trapFocus,
    useFocusTrap: (isActive: boolean) => {
      const containerRef = useRef<HTMLElement>(null);

      useEffect(() => {
        if (isActive && containerRef.current) {
          return trapFocus(containerRef.current);
        }
      }, [isActive]);

      return containerRef;
    },
  };
}

// Accessibility settings panel
export function AccessibilitySettings() {
  const { config, updateConfig } = useAccessibility();

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h3 className="text-lg font-semibold">Erişilebilirlik Ayarları</h3>

      <div className="space-y-3">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={config.highContrast}
            onChange={(e) => updateConfig({ highContrast: e.target.checked })}
            className="rounded"
          />
          <span>Yüksek Kontrast</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={config.largeText}
            onChange={(e) => updateConfig({ largeText: e.target.checked })}
            className="rounded"
          />
          <span>Büyük Metin</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={config.reducedMotion}
            onChange={(e) => updateConfig({ reducedMotion: e.target.checked })}
            className="rounded"
          />
          <span>Azaltılmış Hareket</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={config.announcements}
            onChange={(e) => updateConfig({ announcements: e.target.checked })}
            className="rounded"
          />
          <span>Ekran Okuyucu Duyuruları</span>
        </label>
      </div>
    </div>
  );
}
