'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SliderProps {
  value: [number, number];
  onValueChange: (value: [number, number]) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  disabled?: boolean;
}

export function Slider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  className,
  disabled = false,
}: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null);

  const getValueFromPosition = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return min;

      const rect = trackRef.current.getBoundingClientRect();
      const percentage = Math.max(
        0,
        Math.min(1, (clientX - rect.left) / rect.width)
      );
      const rawValue = min + percentage * (max - min);
      return Math.round(rawValue / step) * step;
    },
    [min, max, step]
  );

  const handleMouseDown = useCallback(
    (thumb: 'start' | 'end') => (event: React.MouseEvent) => {
      if (disabled) return;
      event.preventDefault();
      setIsDragging(thumb);
    },
    [disabled]
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isDragging || disabled) return;

      const newValue = getValueFromPosition(event.clientX);
      const [start, end] = value;

      if (isDragging === 'start') {
        onValueChange([Math.min(newValue, end), end]);
      } else {
        onValueChange([start, Math.max(newValue, start)]);
      }
    },
    [isDragging, disabled, getValueFromPosition, value, onValueChange]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  const handleTrackClick = useCallback(
    (event: React.MouseEvent) => {
      if (disabled || isDragging) return;

      const newValue = getValueFromPosition(event.clientX);
      const [start, end] = value;
      const distanceToStart = Math.abs(newValue - start);
      const distanceToEnd = Math.abs(newValue - end);

      if (distanceToStart < distanceToEnd) {
        onValueChange([newValue, end]);
      } else {
        onValueChange([start, newValue]);
      }
    },
    [disabled, isDragging, getValueFromPosition, value, onValueChange]
  );

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const startPercentage = ((value[0] - min) / (max - min)) * 100;
  const endPercentage = ((value[1] - min) / (max - min)) * 100;

  return (
    <div className={cn('relative w-full', className)}>
      <div
        ref={trackRef}
        onClick={handleTrackClick}
        className={cn(
          'relative h-2 w-full cursor-pointer rounded-full bg-gray-200',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        {/* Active range */}
        <div
          className="absolute h-full rounded-full bg-blue-600"
          style={{
            left: `${startPercentage}%`,
            width: `${endPercentage - startPercentage}%`,
          }}
        />

        {/* Start thumb */}
        <div
          className={cn(
            'absolute top-1/2 h-5 w-5 -translate-y-1/2 cursor-grab rounded-full border-2 border-blue-600 bg-white shadow-sm transition-transform hover:scale-110',
            isDragging === 'start' && 'scale-110 cursor-grabbing',
            disabled && 'cursor-not-allowed'
          )}
          style={{
            left: `${startPercentage}%`,
            transform: 'translateX(-50%) translateY(-50%)',
          }}
          onMouseDown={handleMouseDown('start')}
        />

        {/* End thumb */}
        <div
          className={cn(
            'absolute top-1/2 h-5 w-5 -translate-y-1/2 cursor-grab rounded-full border-2 border-blue-600 bg-white shadow-sm transition-transform hover:scale-110',
            isDragging === 'end' && 'scale-110 cursor-grabbing',
            disabled && 'cursor-not-allowed'
          )}
          style={{
            left: `${endPercentage}%`,
            transform: 'translateX(-50%) translateY(-50%)',
          }}
          onMouseDown={handleMouseDown('end')}
        />
      </div>
    </div>
  );
}
