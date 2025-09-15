'use client';

import React, { useEffect, useRef, useState, ReactNode } from 'react';
import { useFocusTrap } from '@/hooks';
import { useReducedMotion } from '@/lib/shared/animations';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  snapPoints?: number[]; // Heights in vh units
  initialSnap?: number; // Index of initial snap point
  showHandle?: boolean;
  className?: string;
}

export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  snapPoints = [25, 50, 90],
  initialSnap = 1,
  showHandle = true,
  className = '',
}: BottomSheetProps) {
  const [currentSnap, setCurrentSnap] = useState(initialSnap);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const focusTrapRef = useFocusTrap(isOpen);
  const prefersReducedMotion = useReducedMotion();

  const currentHeight = snapPoints[currentSnap];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const touch = e.touches[0];
    setCurrentY(touch.clientY);

    const deltaY = touch.clientY - startY;
    const sheet = sheetRef.current;

    if (sheet) {
      const newHeight = currentHeight - (deltaY / window.innerHeight) * 100;
      const clampedHeight = Math.max(0, Math.min(100, newHeight));
      sheet.style.height = `${clampedHeight}vh`;
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const deltaY = currentY - startY;
    const deltaThreshold = 50; // Minimum distance to trigger snap

    if (Math.abs(deltaY) > deltaThreshold) {
      if (deltaY > 0) {
        // Dragging down
        if (currentSnap > 0) {
          setCurrentSnap(currentSnap - 1);
        } else {
          onClose();
        }
      } else {
        // Dragging up
        if (currentSnap < snapPoints.length - 1) {
          setCurrentSnap(currentSnap + 1);
        }
      }
    }

    // Reset sheet height to current snap point
    const sheet = sheetRef.current;
    if (sheet) {
      sheet.style.height = `${snapPoints[currentSnap]}vh`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={(el) => {
          if (el) {
            sheetRef.current = el;
            focusTrapRef.current = el;
          }
        }}
        className={`fixed right-0 bottom-0 left-0 rounded-t-xl bg-white shadow-2xl ${className} ${
          prefersReducedMotion ? '' : 'transition-all duration-300 ease-out'
        }`}
        style={{
          height: `${currentHeight}vh`,
          transform: isDragging ? 'none' : undefined,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'bottom-sheet-title' : undefined}
        tabIndex={-1}
      >
        {/* Handle */}
        {showHandle && (
          <div className="flex justify-center py-3">
            <div className="h-1 w-12 rounded-full bg-gray-300" />
          </div>
        )}

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <h2
              id="bottom-sheet-title"
              className="text-lg font-semibold text-gray-900"
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">{children}</div>

        {/* Snap Points Indicator */}
        <div className="absolute top-1/2 right-4 flex -translate-y-1/2 flex-col space-y-2">
          {snapPoints.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSnap(index)}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === currentSnap ? 'bg-blue-500' : 'bg-gray-300'
              }`}
              aria-label={`Snap to ${snapPoints[index]}% height`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Specialized bottom sheets
interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  actions: Array<{
    label: string;
    action: () => void;
    variant?: 'default' | 'destructive';
    icon?: React.ComponentType<{ className?: string }>;
  }>;
}

export function ActionSheet({
  isOpen,
  onClose,
  title,
  actions,
}: ActionSheetProps) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      snapPoints={[30]}
      initialSnap={0}
      showHandle={true}
    >
      <div className="px-4 py-2">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => {
              action.action();
              onClose();
            }}
            className={`flex w-full items-center px-4 py-3 text-left text-sm font-medium transition-colors ${
              action.variant === 'destructive'
                ? 'text-red-600 hover:bg-red-50'
                : 'text-gray-900 hover:bg-gray-50'
            } ${index === 0 ? 'rounded-t-lg' : ''} ${
              index === actions.length - 1 ? 'rounded-b-lg' : ''
            }`}
          >
            {action.icon && <action.icon className="mr-3 h-5 w-5" />}
            {action.label}
          </button>
        ))}
      </div>
    </BottomSheet>
  );
}

interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: Record<string, unknown>) => void;
  filters: Record<string, unknown>;
  children: ReactNode;
}

export function FilterSheet({
  isOpen,
  onClose,
  onApply,
  filters,
  children,
}: FilterSheetProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleClear = () => {
    const clearedFilters = Object.keys(localFilters).reduce(
      (acc, key) => ({ ...acc, [key]: null }),
      {}
    );
    setLocalFilters(clearedFilters);
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Filtreler"
      snapPoints={[60, 90]}
      initialSnap={0}
    >
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-y-auto px-4 py-2">{children}</div>

        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-3">
            <button
              onClick={handleClear}
              className="flex-1 rounded-lg border border-gray-300 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Temizle
            </button>
            <button
              onClick={handleApply}
              className="flex-1 rounded-lg bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700"
            >
              Uygula
            </button>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}
