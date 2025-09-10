'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 500,
  className = '',
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const tooltipWidth = 200; // Approximate width
      const tooltipHeight = 32; // Approximate height
      let x = 0;
      let y = 0;

      switch (position) {
        case 'top':
          x = rect.left + rect.width / 2 - tooltipWidth / 2;
          y = rect.top - tooltipHeight - 8;
          break;
        case 'bottom':
          x = rect.left + rect.width / 2 - tooltipWidth / 2;
          y = rect.bottom + 8;
          break;
        case 'left':
          x = rect.left - tooltipWidth - 8;
          y = rect.top + rect.height / 2 - tooltipHeight / 2;
          break;
        case 'right':
          x = rect.right + 8;
          y = rect.top + rect.height / 2 - tooltipHeight / 2;
          break;
      }

      // Keep tooltip within viewport
      if (x < 8) x = 8;
      if (x + tooltipWidth > window.innerWidth - 8) {
        x = window.innerWidth - tooltipWidth - 8;
      }
      if (y < 8) y = 8;
      if (y + tooltipHeight > window.innerHeight - 8) {
        y = window.innerHeight - tooltipHeight - 8;
      }

      setTooltipPosition({ x, y });
    }
  }, [isVisible, position]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const tooltipElement = isVisible ? (
    <div
      className={`fixed z-50 rounded-md bg-gray-900 px-3 py-2 text-sm text-white shadow-lg transition-opacity duration-200 ${className}`}
      style={{
        left: `${tooltipPosition.x}px`,
        top: `${tooltipPosition.y}px`,
        maxWidth: '200px',
        wordWrap: 'break-word',
      }}
    >
      {content}
      <div
        className={`absolute h-2 w-2 rotate-45 bg-gray-900 ${
          position === 'top'
            ? 'bottom-[-4px] left-1/2 -translate-x-1/2'
            : position === 'bottom'
              ? 'top-[-4px] left-1/2 -translate-x-1/2'
              : position === 'left'
                ? 'top-1/2 right-[-4px] -translate-y-1/2'
                : 'top-1/2 left-[-4px] -translate-y-1/2'
        }`}
      />
    </div>
  ) : null;

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-block"
      >
        {children}
      </div>
      {typeof window !== 'undefined' && tooltipElement
        ? createPortal(tooltipElement, document.body)
        : null}
    </>
  );
}
