'use client';

/**
 * Circular Progress Component
 * Sprint 1 - Story 1.5: UI Improvements
 *
 * Animated circular progress indicator for profile completion
 *
 * @version 1.0.0
 * @since 2025-11-25
 */

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface CircularProgressProps {
  /** Progress percentage (0-100) */
  progress: number;

  /** Circle size in pixels */
  size?: number;

  /** Stroke width in pixels */
  strokeWidth?: number;

  /** Progress color */
  progressColor?: string;

  /** Track color */
  trackColor?: string;

  /** Show percentage text */
  showPercentage?: boolean;

  /** Custom content inside circle */
  children?: React.ReactNode;

  /** Custom className */
  className?: string;

  /** Animation duration in seconds */
  animationDuration?: number;
}

/**
 * Circular Progress Component
 */
export function CircularProgress({
  progress,
  size = 120,
  strokeWidth = 8,
  progressColor = '#3B82F6',
  trackColor = '#E5E7EB',
  showPercentage = true,
  children,
  className = '',
  animationDuration = 1,
}: CircularProgressProps) {
  // Ensure progress is between 0 and 100
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  // Calculate circle properties
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (clampedProgress / 100) * circumference;

  // Center point
  const center = size / 2;

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center',
        className
      )}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90 transform">
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress circle */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{
            duration: animationDuration,
            ease: 'easeInOut',
          }}
        />
      </svg>

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children ||
          (showPercentage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="text-center"
            >
              <div className="text-2xl font-bold text-gray-900">
                {Math.round(clampedProgress)}%
              </div>
            </motion.div>
          ))}
      </div>
    </div>
  );
}

/**
 * Multi-color Circular Progress
 * Changes color based on progress thresholds
 */
export interface MultiColorCircularProgressProps
  extends Omit<CircularProgressProps, 'progressColor'> {
  /** Color thresholds */
  colorThresholds?: {
    low: { threshold: number; color: string };
    medium: { threshold: number; color: string };
    high: { threshold: number; color: string };
  };
}

export function MultiColorCircularProgress({
  progress,
  colorThresholds = {
    low: { threshold: 33, color: '#EF4444' }, // red-500
    medium: { threshold: 66, color: '#F59E0B' }, // amber-500
    high: { threshold: 100, color: '#10B981' }, // green-500
  },
  ...props
}: MultiColorCircularProgressProps) {
  // Determine color based on progress
  const getProgressColor = () => {
    if (progress >= colorThresholds.high.threshold) {
      return colorThresholds.high.color;
    }
    if (progress >= colorThresholds.medium.threshold) {
      return colorThresholds.medium.color;
    }
    return colorThresholds.low.color;
  };

  return (
    <CircularProgress
      progress={progress}
      progressColor={getProgressColor()}
      {...props}
    />
  );
}

export default CircularProgress;
