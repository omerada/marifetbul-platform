'use client';

import React, { useCallback } from 'react';
import { logger } from '@/lib/shared/utils/logger';

interface HapticEngine {
  impactOccurred: (intensity: HapticIntensity) => void;
  notificationOccurred: (type: NotificationHapticType) => void;
  selectionChanged: () => void;
}

type HapticIntensity = 'light' | 'medium' | 'heavy';
type HapticType = 'impact' | 'notification' | 'selection';
type NotificationHapticType = 'success' | 'warning' | 'error';

interface HapticFeedbackOptions {
  intensity?: HapticIntensity;
  type?: HapticType;
  notificationType?: NotificationHapticType;
  duration?: number;
  fallbackToVibration?: boolean;
}

export function useHapticFeedback() {
  // Check if device supports haptic feedback
  const isHapticSupported = useCallback(() => {
    if (typeof window === 'undefined') return false;

    // Check for iOS haptic feedback
    if ('DeviceMotionEvent' in window && 'hapticFeedback' in window) {
      return true;
    }

    // Check for Android haptic feedback via vibration API
    if ('vibrate' in navigator) {
      return true;
    }

    return false;
  }, []);

  // Main haptic trigger function
  const triggerHaptic = useCallback(
    (
      type: HapticType = 'impact',
      intensity: HapticIntensity = 'medium',
      notificationType?: NotificationHapticType
    ) => {
      if (typeof window === 'undefined') return;

      try {
        // iOS Haptic Feedback (if available)
        if ('hapticFeedback' in window) {
          const hapticEngine = (
            window as Window & { hapticFeedback: HapticEngine }
          ).hapticFeedback;

          switch (type) {
            case 'impact':
              hapticEngine.impactOccurred(intensity);
              break;
            case 'notification':
              if (notificationType) {
                hapticEngine.notificationOccurred(notificationType);
              }
              break;
            case 'selection':
              hapticEngine.selectionChanged();
              break;
          }
          return;
        }

        // Fallback to Web Vibration API
        if ('vibrate' in navigator) {
          const vibrationPatterns = {
            light: [10],
            medium: [20],
            heavy: [30],
          };

          const notificationPatterns = {
            success: [10, 50, 10],
            warning: [20, 50, 20],
            error: [30, 50, 30, 50, 30],
          };

          if (type === 'notification' && notificationType) {
            navigator.vibrate(notificationPatterns[notificationType]);
          } else if (type === 'selection') {
            navigator.vibrate([5]);
          } else {
            navigator.vibrate(vibrationPatterns[intensity]);
          }
        }
      } catch (error) {
        logger.warn('Haptic feedback not available:', error);
      }
    },
    []
  );

  // Convenience methods
  const triggerImpact = useCallback(
    (intensity: HapticIntensity = 'medium') => {
      triggerHaptic('impact', intensity);
    },
    [triggerHaptic]
  );

  const triggerNotification = useCallback(
    (type: NotificationHapticType = 'success') => {
      triggerHaptic('notification', 'medium', type);
    },
    [triggerHaptic]
  );

  const triggerSelection = useCallback(() => {
    triggerHaptic('selection');
  }, [triggerHaptic]);

  // Touch interaction helpers
  const onPress = useCallback(
    (callback?: () => void) => {
      return {
        onTouchStart: () => triggerSelection(),
        onClick: () => {
          triggerImpact('light');
          callback?.();
        },
      };
    },
    [triggerSelection, triggerImpact]
  );

  const onLongPress = useCallback(
    (callback?: () => void) => {
      return {
        onTouchStart: () => {
          const timer = setTimeout(() => {
            triggerImpact('medium');
            callback?.();
          }, 500);

          return () => clearTimeout(timer);
        },
      };
    },
    [triggerImpact]
  );

  // Button interaction with haptic feedback
  const enhanceButtonProps = useCallback(
    (props: Record<string, unknown>, options: HapticFeedbackOptions = {}) => {
      const { intensity = 'light', type = 'impact' } = options;

      return {
        ...props,
        onClick: (e: React.MouseEvent) => {
          triggerHaptic(type, intensity);
          (props.onClick as ((e: React.MouseEvent) => void) | undefined)?.(e);
        },
        onTouchStart: (e: React.TouchEvent) => {
          if (type === 'selection') {
            triggerSelection();
          }
          (props.onTouchStart as ((e: React.TouchEvent) => void) | undefined)?.(
            e
          );
        },
      };
    },
    [triggerHaptic, triggerSelection]
  );

  return {
    isHapticSupported: isHapticSupported(),
    triggerHaptic,
    triggerImpact,
    triggerNotification,
    triggerSelection,
    onPress,
    onLongPress,
    enhanceButtonProps,
  };
}

// Simple wrapper component for haptic feedback
export function HapticButton({
  children,
  onClick,
  hapticType = 'impact',
  hapticIntensity = 'light',
  ...props
}: {
  children: React.ReactNode;
  onClick?: () => void;
  hapticType?: HapticType;
  hapticIntensity?: HapticIntensity;
  [key: string]: unknown;
}) {
  const { triggerHaptic } = useHapticFeedback();

  const handleClick = () => {
    triggerHaptic(hapticType, hapticIntensity);
    onClick?.();
  };

  return React.createElement(
    'button',
    { ...props, onClick: handleClick },
    children
  );
}

// React hook for haptic patterns
export function useHapticPatterns() {
  const { triggerHaptic } = useHapticFeedback();

  const patterns = {
    // UI interactions
    buttonPress: () => triggerHaptic('impact', 'light'),
    buttonLongPress: () => triggerHaptic('impact', 'medium'),
    switchToggle: () => triggerHaptic('selection'),
    tabSwitch: () => triggerHaptic('selection'),

    // Navigation
    pageSwipe: () => triggerHaptic('impact', 'light'),
    pullToRefresh: () => triggerHaptic('impact', 'medium'),
    refreshComplete: () => triggerHaptic('notification', 'medium', 'success'),

    // Feedback patterns
    success: () => triggerHaptic('notification', 'medium', 'success'),
    error: () => triggerHaptic('notification', 'medium', 'error'),
    warning: () => triggerHaptic('notification', 'medium', 'warning'),

    // Custom patterns using vibration
    heartbeat: () => {
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100, 50, 200]);
      }
    },

    typing: () => triggerHaptic('selection'),

    notification: () => {
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    },
  };

  return patterns;
}
