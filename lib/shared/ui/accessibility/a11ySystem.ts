// ================================================
// ACCESSIBILITY SYSTEM (A11Y)
// ================================================
// WCAG 2.1 AA compliant accessibility utilities

import { useEffect, useRef, useState, useCallback } from 'react';

// ================================
// TYPES
// ================================

export interface A11yConfig {
  level: 'A' | 'AA' | 'AAA';
  enableScreenReaderSupport: boolean;
  enableKeyboardNavigation: boolean;
  enableHighContrast: boolean;
  enableReducedMotion: boolean;
  announcePageChanges: boolean;
  focusManagement: boolean;
}

export interface FocusableElement extends HTMLElement {
  tabIndex: number;
}

export interface A11yMetrics {
  focusTraps: number;
  keyboardNavigations: number;
  screenReaderAnnouncements: number;
  colorContrastViolations: number;
  lastChecked: Date;
}

export interface ScreenReaderText {
  text: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  interrupt?: boolean;
}

// ================================
// DEFAULT CONFIG
// ================================

export const DEFAULT_A11Y_CONFIG: A11yConfig = {
  level: 'AA',
  enableScreenReaderSupport: true,
  enableKeyboardNavigation: true,
  enableHighContrast: false,
  enableReducedMotion: false,
  announcePageChanges: true,
  focusManagement: true,
};

// ================================
// ARIA ATTRIBUTES MANAGER
// ================================

export class AriaManager {
  private static instance: AriaManager;
  private liveRegions: Map<string, HTMLElement> = new Map();

  static getInstance(): AriaManager {
    if (!AriaManager.instance) {
      AriaManager.instance = new AriaManager();
    }
    return AriaManager.instance;
  }

  // Create live region for announcements
  createLiveRegion(
    id: string,
    level: 'polite' | 'assertive' = 'polite'
  ): HTMLElement {
    if (this.liveRegions.has(id)) {
      return this.liveRegions.get(id)!;
    }

    const region = document.createElement('div');
    region.id = id;
    region.setAttribute('aria-live', level);
    region.setAttribute('aria-atomic', 'true');
    region.className = 'sr-only'; // Screen reader only
    region.style.cssText = `
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    `;

    document.body.appendChild(region);
    this.liveRegions.set(id, region);
    return region;
  }

  // Announce to screen readers
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const regionId = `aria-live-${priority}`;
    let region = this.liveRegions.get(regionId);

    if (!region) {
      region = this.createLiveRegion(regionId, priority);
    }

    // Clear and set new message
    region.textContent = '';
    setTimeout(() => {
      region!.textContent = message;
    }, 100);
  }

  // Set ARIA attributes on element
  setAttributes(
    element: HTMLElement,
    attributes: Record<string, string | boolean | number>
  ): void {
    Object.entries(attributes).forEach(([key, value]) => {
      if (key.startsWith('aria-') || key.startsWith('data-')) {
        element.setAttribute(key, String(value));
      }
    });
  }

  // Remove ARIA attributes
  removeAttributes(element: HTMLElement, attributes: string[]): void {
    attributes.forEach((attr) => {
      element.removeAttribute(attr);
    });
  }
}

// ================================
// FOCUS MANAGEMENT
// ================================

export class FocusManager {
  private focusHistory: HTMLElement[] = [];
  private trapStack: HTMLElement[] = [];

  // Get all focusable elements
  getFocusableElements(
    container: HTMLElement = document.body
  ): FocusableElement[] {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelectors)).filter(
      (el) => !this.isHidden(el as HTMLElement)
    ) as FocusableElement[];
  }

  // Check if element is hidden
  private isHidden(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element);
    return (
      style.display === 'none' ||
      style.visibility === 'hidden' ||
      style.opacity === '0' ||
      element.hidden ||
      element.getAttribute('aria-hidden') === 'true'
    );
  }

  // Focus first focusable element
  focusFirst(container?: HTMLElement): boolean {
    const focusable = this.getFocusableElements(container);
    if (focusable.length > 0) {
      focusable[0].focus();
      return true;
    }
    return false;
  }

  // Focus last focusable element
  focusLast(container?: HTMLElement): boolean {
    const focusable = this.getFocusableElements(container);
    if (focusable.length > 0) {
      focusable[focusable.length - 1].focus();
      return true;
    }
    return false;
  }

  // Create focus trap
  trapFocus(container: HTMLElement): () => void {
    this.trapStack.push(container);

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusable = this.getFocusableElements(container);
      if (focusable.length === 0) return;

      const firstFocusable = focusable[0];
      const lastFocusable = focusable[focusable.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstFocusable) {
          event.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          event.preventDefault();
          firstFocusable.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);

    // Focus first element
    this.focusFirst(container);

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleTabKey);
      this.trapStack.pop();
    };
  }

  // Save current focus
  saveFocus(): void {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && activeElement !== document.body) {
      this.focusHistory.push(activeElement);
    }
  }

  // Restore previous focus
  restoreFocus(): boolean {
    const lastFocused = this.focusHistory.pop();
    if (lastFocused && document.contains(lastFocused)) {
      lastFocused.focus();
      return true;
    }
    return false;
  }
}

// ================================
// KEYBOARD NAVIGATION
// ================================

export class KeyboardNavigationManager {
  private navigationHandlers: Map<string, (event: KeyboardEvent) => void> =
    new Map();

  // Register keyboard navigation
  registerNavigation(
    selector: string,
    handlers: {
      onArrowUp?: (event: KeyboardEvent) => void;
      onArrowDown?: (event: KeyboardEvent) => void;
      onArrowLeft?: (event: KeyboardEvent) => void;
      onArrowRight?: (event: KeyboardEvent) => void;
      onEnter?: (event: KeyboardEvent) => void;
      onEscape?: (event: KeyboardEvent) => void;
      onHome?: (event: KeyboardEvent) => void;
      onEnd?: (event: KeyboardEvent) => void;
    }
  ): () => void {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (!target.matches(selector)) return;

      switch (event.key) {
        case 'ArrowUp':
          handlers.onArrowUp?.(event);
          break;
        case 'ArrowDown':
          handlers.onArrowDown?.(event);
          break;
        case 'ArrowLeft':
          handlers.onArrowLeft?.(event);
          break;
        case 'ArrowRight':
          handlers.onArrowRight?.(event);
          break;
        case 'Enter':
          handlers.onEnter?.(event);
          break;
        case 'Escape':
          handlers.onEscape?.(event);
          break;
        case 'Home':
          handlers.onHome?.(event);
          break;
        case 'End':
          handlers.onEnd?.(event);
          break;
      }
    };

    document.addEventListener('keydown', handler);
    this.navigationHandlers.set(selector, handler);

    return () => {
      document.removeEventListener('keydown', handler);
      this.navigationHandlers.delete(selector);
    };
  }

  // Skip link functionality
  createSkipLink(
    targetId: string,
    text: string = 'Skip to main content'
  ): HTMLElement {
    const skipLink = document.createElement('a');
    skipLink.href = `#${targetId}`;
    skipLink.textContent = text;
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      background: #000;
      color: #fff;
      padding: 8px;
      text-decoration: none;
      border-radius: 0 0 4px 4px;
      z-index: 9999;
      transition: top 0.3s;
    `;

    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '0';
    });

    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });

    skipLink.addEventListener('click', (event) => {
      event.preventDefault();
      const target = document.getElementById(targetId);
      if (target) {
        target.focus();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });

    return skipLink;
  }
}

// ================================
// COLOR CONTRAST UTILITIES
// ================================

export class ColorContrastChecker {
  // Calculate relative luminance
  private getRelativeLuminance(rgb: [number, number, number]): number {
    const [r, g, b] = rgb.map((channel) => {
      const normalized = channel / 255;
      return normalized <= 0.03928
        ? normalized / 12.92
        : Math.pow((normalized + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  // Calculate contrast ratio
  getContrastRatio(color1: string, color2: string): number {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);

    if (!rgb1 || !rgb2) return 0;

    const lum1 = this.getRelativeLuminance(rgb1);
    const lum2 = this.getRelativeLuminance(rgb2);

    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  // Convert hex to RGB
  private hexToRgb(hex: string): [number, number, number] | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16),
        ]
      : null;
  }

  // Check if contrast meets WCAG standards
  checkContrast(
    foreground: string,
    background: string,
    level: 'A' | 'AA' | 'AAA' = 'AA',
    size: 'normal' | 'large' = 'normal'
  ): { passes: boolean; ratio: number; required: number } {
    const ratio = this.getContrastRatio(foreground, background);

    let required: number;
    if (level === 'AAA') {
      required = size === 'large' ? 4.5 : 7;
    } else {
      required = size === 'large' ? 3 : 4.5;
    }

    return {
      passes: ratio >= required,
      ratio,
      required,
    };
  }

  // Scan page for contrast violations
  scanPageContrast(): Array<{
    element: HTMLElement;
    foreground: string;
    background: string;
    ratio: number;
    passes: boolean;
  }> {
    const violations: Array<{
      element: HTMLElement;
      foreground: string;
      background: string;
      ratio: number;
      passes: boolean;
    }> = [];

    // Get all text elements
    const textElements = document.querySelectorAll(
      'p, span, a, button, h1, h2, h3, h4, h5, h6, li, td, th'
    );

    textElements.forEach((element) => {
      const styles = window.getComputedStyle(element);
      const foreground = styles.color;
      const background = styles.backgroundColor;

      if (foreground && background && background !== 'rgba(0, 0, 0, 0)') {
        const ratio = this.getContrastRatio(foreground, background);
        const passes = ratio >= 4.5; // AA standard for normal text

        if (!passes) {
          violations.push({
            element: element as HTMLElement,
            foreground,
            background,
            ratio,
            passes,
          });
        }
      }
    });

    return violations;
  }
}

// ================================
// HOOKS
// ================================

// Screen reader announcements hook
export function useScreenReader(): {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
} {
  const ariaManager = AriaManager.getInstance();

  const announce = useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      ariaManager.announce(message, priority);
    },
    [ariaManager]
  );

  return { announce };
}

// Focus management hook
export function useFocusManagement(): {
  trapFocus: (containerRef: React.RefObject<HTMLElement>) => () => void;
  saveFocus: () => void;
  restoreFocus: () => void;
  focusFirst: (containerRef?: React.RefObject<HTMLElement>) => void;
} {
  const focusManager = useRef(new FocusManager()).current;

  const trapFocus = useCallback(
    (containerRef: React.RefObject<HTMLElement>) => {
      if (containerRef.current) {
        return focusManager.trapFocus(containerRef.current);
      }
      return () => {};
    },
    [focusManager]
  );

  const saveFocus = useCallback(() => {
    focusManager.saveFocus();
  }, [focusManager]);

  const restoreFocus = useCallback(() => {
    focusManager.restoreFocus();
  }, [focusManager]);

  const focusFirst = useCallback(
    (containerRef?: React.RefObject<HTMLElement>) => {
      if (containerRef?.current) {
        focusManager.focusFirst(containerRef.current);
      } else {
        focusManager.focusFirst();
      }
    },
    [focusManager]
  );

  return {
    trapFocus,
    saveFocus,
    restoreFocus,
    focusFirst,
  };
}

// Keyboard navigation hook
export function useKeyboardNavigation(
  containerRef: React.RefObject<HTMLElement>,
  options: {
    enableArrowKeys?: boolean;
    enableHomeEnd?: boolean;
    onEnter?: () => void;
    onEscape?: () => void;
  } = {}
): void {
  const {
    enableArrowKeys = true,
    enableHomeEnd = true,
    onEnter,
    onEscape,
  } = options;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const focusManager = new FocusManager();
      const focusableElements = focusManager.getFocusableElements(container);
      const currentIndex = focusableElements.indexOf(
        document.activeElement as FocusableElement
      );

      if (enableArrowKeys) {
        switch (event.key) {
          case 'ArrowDown':
          case 'ArrowRight':
            event.preventDefault();
            const nextIndex = (currentIndex + 1) % focusableElements.length;
            focusableElements[nextIndex]?.focus();
            break;
          case 'ArrowUp':
          case 'ArrowLeft':
            event.preventDefault();
            const prevIndex =
              currentIndex === 0
                ? focusableElements.length - 1
                : currentIndex - 1;
            focusableElements[prevIndex]?.focus();
            break;
        }
      }

      if (enableHomeEnd) {
        switch (event.key) {
          case 'Home':
            event.preventDefault();
            focusableElements[0]?.focus();
            break;
          case 'End':
            event.preventDefault();
            focusableElements[focusableElements.length - 1]?.focus();
            break;
        }
      }

      switch (event.key) {
        case 'Enter':
          onEnter?.();
          break;
        case 'Escape':
          onEscape?.();
          break;
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [containerRef, enableArrowKeys, enableHomeEnd, onEnter, onEscape]);
}

// Reduced motion preference hook
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

// High contrast preference hook
export function useHighContrast(): boolean {
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setPrefersHighContrast(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersHighContrast(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersHighContrast;
}

// ================================
// ACCESSIBILITY PROVIDER
// ================================

export class AccessibilityManager {
  private config: A11yConfig;
  private metrics: A11yMetrics;
  private ariaManager: AriaManager;
  private focusManager: FocusManager;
  private keyboardManager: KeyboardNavigationManager;
  private contrastChecker: ColorContrastChecker;

  constructor(config: Partial<A11yConfig> = {}) {
    this.config = { ...DEFAULT_A11Y_CONFIG, ...config };
    this.metrics = {
      focusTraps: 0,
      keyboardNavigations: 0,
      screenReaderAnnouncements: 0,
      colorContrastViolations: 0,
      lastChecked: new Date(),
    };

    this.ariaManager = AriaManager.getInstance();
    this.focusManager = new FocusManager();
    this.keyboardManager = new KeyboardNavigationManager();
    this.contrastChecker = new ColorContrastChecker();

    this.initialize();
  }

  private initialize(): void {
    if (this.config.announcePageChanges) {
      this.setupPageChangeAnnouncements();
    }

    if (this.config.enableKeyboardNavigation) {
      this.setupGlobalKeyboardNavigation();
    }

    this.setupSkipLinks();
    this.runAccessibilityChecks();
  }

  private setupPageChangeAnnouncements(): void {
    // Monitor page changes (for SPA)
    let currentPath = window.location.pathname;

    const observer = new MutationObserver(() => {
      if (window.location.pathname !== currentPath) {
        currentPath = window.location.pathname;
        this.announcePageChange();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  private announcePageChange(): void {
    const title = document.title;
    const mainHeading = document.querySelector('h1')?.textContent;
    const announcement = mainHeading || title || 'Page changed';

    this.ariaManager.announce(`Navigated to ${announcement}`, 'polite');
    this.metrics.screenReaderAnnouncements++;
  }

  private setupGlobalKeyboardNavigation(): void {
    // Global keyboard shortcuts
    this.keyboardManager.registerNavigation('*', {
      onEscape: () => {
        // Close modals, menus, etc.
        const closeButtons = document.querySelectorAll(
          '[aria-label*="close"], [aria-label*="Close"]'
        );
        if (closeButtons.length > 0) {
          (closeButtons[0] as HTMLElement).click();
        }
      },
    });
  }

  private setupSkipLinks(): void {
    const main = document.querySelector('main, [role="main"]');
    if (main && !main.id) {
      main.id = 'main-content';
    }

    const skipLink = this.keyboardManager.createSkipLink('main-content');
    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  private runAccessibilityChecks(): void {
    // Check color contrast
    const violations = this.contrastChecker.scanPageContrast();
    this.metrics.colorContrastViolations = violations.length;

    if (violations.length > 0) {
      console.warn(
        `Found ${violations.length} color contrast violations:`,
        violations
      );
    }

    this.metrics.lastChecked = new Date();
  }

  // Public API
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    this.ariaManager.announce(message, priority);
    this.metrics.screenReaderAnnouncements++;
  }

  trapFocus(container: HTMLElement): () => void {
    this.metrics.focusTraps++;
    return this.focusManager.trapFocus(container);
  }

  checkContrast(foreground: string, background: string): boolean {
    const result = this.contrastChecker.checkContrast(
      foreground,
      background,
      this.config.level
    );
    return result.passes;
  }

  getMetrics(): A11yMetrics {
    return { ...this.metrics };
  }

  updateConfig(newConfig: Partial<A11yConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// ================================
// EXPORTS
// ================================

export default {
  AccessibilityManager,
  AriaManager,
  FocusManager,
  KeyboardNavigationManager,
  ColorContrastChecker,

  // Hooks
  useScreenReader,
  useFocusManagement,
  useKeyboardNavigation,
  useReducedMotion,
  useHighContrast,

  // Constants
  DEFAULT_A11Y_CONFIG,
};
