'use client';

import React, {
  useState,
  useRef,
  useEffect,
  createContext,
  useContext,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface TooltipContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const TooltipContext = createContext<TooltipContextType>({
  isOpen: false,
  setIsOpen: () => {},
});

interface TooltipProps {
  children: React.ReactNode;
  delayDuration?: number;
}

interface TooltipTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

interface TooltipContentProps {
  children: React.ReactNode;
  className?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
}

// Basic tooltip for backwards compatibility
interface BasicTooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function Tooltip({ children, delayDuration = 500 }: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const contextValue = React.useMemo(
    () => ({
      isOpen,
      setIsOpen: (open: boolean) => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        if (open) {
          timeoutRef.current = setTimeout(() => setIsOpen(true), delayDuration);
        } else {
          setIsOpen(false);
        }
      },
    }),
    [isOpen, delayDuration]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <TooltipContext.Provider value={contextValue}>
      <div className="relative inline-block">{children}</div>
    </TooltipContext.Provider>
  );
}

export function TooltipTrigger({
  children,
  asChild = false,
}: TooltipTriggerProps) {
  const { setIsOpen } = useContext(TooltipContext);

  const handleMouseEnter = () => setIsOpen(true);
  const handleMouseLeave = () => setIsOpen(false);
  const handleFocus = () => setIsOpen(true);
  const handleBlur = () => setIsOpen(false);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onFocus: handleFocus,
      onBlur: handleBlur,
    } as any);
  }

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className="inline-block"
    >
      {children}
    </div>
  );
}

export function TooltipContent({
  children,
  className,
  side = 'top',
  sideOffset = 4,
}: TooltipContentProps) {
  const { isOpen } = useContext(TooltipContext);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const tooltipWidth = 200;
      const tooltipHeight = 32;
      let x = 0;
      let y = 0;

      switch (side) {
        case 'top':
          x = rect.left + rect.width / 2 - tooltipWidth / 2;
          y = rect.top - tooltipHeight - sideOffset;
          break;
        case 'bottom':
          x = rect.left + rect.width / 2 - tooltipWidth / 2;
          y = rect.bottom + sideOffset;
          break;
        case 'left':
          x = rect.left - tooltipWidth - sideOffset;
          y = rect.top + rect.height / 2 - tooltipHeight / 2;
          break;
        case 'right':
          x = rect.right + sideOffset;
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

      setPosition({ x, y });
    }
  }, [isOpen, side, sideOffset]);

  if (!isOpen) return null;

  const tooltipElement = (
    <div
      className={cn(
        'animate-in fade-in-0 zoom-in-95 fixed z-50 rounded-md bg-gray-900 px-3 py-2 text-sm text-white shadow-lg',
        className
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        maxWidth: '200px',
      }}
    >
      {children}
    </div>
  );

  return typeof window !== 'undefined'
    ? createPortal(tooltipElement, document.body)
    : null;
}

// Basic tooltip component for backwards compatibility
export function BasicTooltip({
  content,
  children,
  position = 'top',
  delay = 500,
  className = '',
}: BasicTooltipProps) {
  return (
    <Tooltip delayDuration={delay}>
      <TooltipTrigger>{children}</TooltipTrigger>
      <TooltipContent side={position} className={className}>
        {content}
      </TooltipContent>
    </Tooltip>
  );
}
