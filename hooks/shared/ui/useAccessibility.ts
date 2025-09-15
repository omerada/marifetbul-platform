'use client';

import React, { useEffect, useRef, useCallback } from 'react';

export function useFocusTrap(isActive: boolean = true) {
  const containerRef = useRef<HTMLElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const getFocusableElements = useCallback((container: HTMLElement) => {
    const focusableElementsString = [
      'a[href]',
      'area[href]',
      'input:not([disabled]):not([tabindex="-1"])',
      'select:not([disabled]):not([tabindex="-1"])',
      'textarea:not([disabled]):not([tabindex="-1"])',
      'button:not([disabled]):not([tabindex="-1"])',
      'iframe',
      'object',
      'embed',
      '[contenteditable]',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    return Array.from(
      container.querySelectorAll(focusableElementsString)
    ) as HTMLElement[];
  }, []);

  const handleTabKey = useCallback(
    (e: KeyboardEvent) => {
      if (!isActive || !containerRef.current) return;

      const focusableElements = getFocusableElements(containerRef.current);

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.key === 'Tab') {
        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }

      if (e.key === 'Escape') {
        // Optional: Close modal/trap on Escape
        previousActiveElement.current?.focus();
      }
    },
    [isActive, getFocusableElements]
  );

  useEffect(() => {
    if (isActive && containerRef.current) {
      // Store the currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Focus the first focusable element
      const focusableElements = getFocusableElements(containerRef.current);
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }

      // Add event listener
      document.addEventListener('keydown', handleTabKey);

      return () => {
        document.removeEventListener('keydown', handleTabKey);
        // Restore focus to previous element
        if (previousActiveElement.current) {
          previousActiveElement.current.focus();
        }
      };
    }
  }, [isActive, handleTabKey, getFocusableElements]);

  return containerRef;
}

export function useSkipToContent() {
  const skipLinkRef = useRef<HTMLAnchorElement>(null);
  const contentRef = useRef<HTMLElement>(null);

  const handleSkipToContent = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      contentRef.current?.focus();
    }
  }, []);

  return {
    skipLinkRef,
    contentRef,
    handleSkipToContent,
  };
}

export function useAnnouncer() {
  const announcerRef = useRef<HTMLDivElement>(null);

  const announce = useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      if (!announcerRef.current) return;

      announcerRef.current.setAttribute('aria-live', priority);
      announcerRef.current.textContent = message;

      // Clear after announcement
      setTimeout(() => {
        if (announcerRef.current) {
          announcerRef.current.textContent = '';
        }
      }, 1000);
    },
    []
  );

  const LiveRegion = useCallback(
    () =>
      React.createElement('div', {
        ref: announcerRef,
        'aria-live': 'polite',
        'aria-atomic': 'true',
        className: 'sr-only',
      }),
    []
  );

  return {
    announce,
    LiveRegion,
  };
}

// Main accessibility hook export
export function useAccessibility() {
  const focusTrap = useFocusTrap();
  const skipToContent = useSkipToContent();
  const announcer = useAnnouncer();

  return {
    focusTrap,
    skipToContent,
    announcer,
  };
}
