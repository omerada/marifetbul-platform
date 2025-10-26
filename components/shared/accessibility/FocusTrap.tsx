'use client';

import React, { useEffect, useRef } from 'react';

/**
 * FocusTrap - Trap focus within a component (e.g., modals, dialogs)
 *
 * Ensures keyboard users can't tab out of a modal into the page behind it.
 * Essential for WCAG 2.1 AA compliance.
 *
 * Usage:
 * ```tsx
 * <FocusTrap active={isModalOpen}>
 *   <div role="dialog">
 *     <h2>Modal Title</h2>
 *     <button>Close</button>
 *   </div>
 * </FocusTrap>
 * ```
 *
 * @see https://www.w3.org/WAI/WCAG21/Techniques/client-side-script/SCR26
 */

interface FocusTrapProps {
  /**
   * Whether focus trap is active
   */
  active: boolean;

  /**
   * Whether to restore focus to previous element on deactivate
   */
  restoreFocus?: boolean;

  /**
   * Whether to focus first element on activate
   */
  initialFocus?: boolean;

  /**
   * Children to trap focus within
   */
  children: React.ReactNode;
}

export function FocusTrap({
  active,
  restoreFocus = true,
  initialFocus = true,
  children,
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    // Store previous focus
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Focus first focusable element
    if (initialFocus) {
      const firstFocusable = getFocusableElements()[0];
      firstFocusable?.focus();
    }

    // Trap focus
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Shift + Tab on first element -> focus last
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
      // Tab on last element -> focus first
      else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      // Restore previous focus
      if (restoreFocus && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [active, initialFocus, restoreFocus]);

  const getFocusableElements = (): HTMLElement[] => {
    if (!containerRef.current) return [];

    const selector = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    return Array.from(containerRef.current.querySelectorAll(selector));
  };

  return <div ref={containerRef}>{children}</div>;
}

/**
 * useFocusTrap - Hook for focus trapping
 *
 * Usage:
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 * const trapRef = useFocusTrap(isOpen);
 *
 * return (
 *   <div ref={trapRef} role="dialog">
 *     {content}
 *   </div>
 * );
 * ```
 */
export function useFocusTrap(
  active: boolean,
  options: {
    restoreFocus?: boolean;
    initialFocus?: boolean;
  } = {}
) {
  const { restoreFocus = true, initialFocus = true } = options;
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    previousFocusRef.current = document.activeElement as HTMLElement;

    if (initialFocus) {
      const firstFocusable = getFocusableElements(containerRef.current)[0];
      firstFocusable?.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !containerRef.current) return;

      const focusableElements = getFocusableElements(containerRef.current);
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      if (restoreFocus && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [active, initialFocus, restoreFocus]);

  return containerRef;
}

/**
 * Helper function to get all focusable elements
 */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');

  return Array.from(container.querySelectorAll(selector));
}

export default FocusTrap;
