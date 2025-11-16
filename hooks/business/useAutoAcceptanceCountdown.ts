/**
 * ================================================
 * AUTO-ACCEPTANCE COUNTDOWN HOOK
 * ================================================
 * Sprint 1 - Story 1.8
 * Manages 72-hour auto-acceptance countdown for delivered milestones
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import { useState, useEffect, useMemo } from 'react';

// ================================================
// TYPES
// ================================================

export interface CountdownTime {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isExpired: boolean;
  formattedTime: string;
}

// ================================================
// CONSTANTS
// ================================================

const AUTO_ACCEPT_HOURS = 72; // 72 hours = 3 days
const MILLISECONDS_IN_SECOND = 1000;
const SECONDS_IN_MINUTE = 60;
const MINUTES_IN_HOUR = 60;

// ================================================
// HELPERS
// ================================================

function calculateRemaining(targetDate: Date): CountdownTime {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();

  if (diff <= 0) {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
      isExpired: true,
      formattedTime: 'Otomatik onay zamanı geldi',
    };
  }

  const totalSeconds = Math.floor(diff / MILLISECONDS_IN_SECOND);
  const hours = Math.floor(
    totalSeconds / (SECONDS_IN_MINUTE * MINUTES_IN_HOUR)
  );
  const minutes = Math.floor(
    (totalSeconds % (SECONDS_IN_MINUTE * MINUTES_IN_HOUR)) / SECONDS_IN_MINUTE
  );
  const seconds = totalSeconds % SECONDS_IN_MINUTE;

  return {
    hours,
    minutes,
    seconds,
    totalSeconds,
    isExpired: false,
    formattedTime: formatCountdown(hours, minutes, seconds),
  };
}

function formatCountdown(
  hours: number,
  minutes: number,
  seconds: number
): string {
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days} gün ${remainingHours} saat`;
  }

  if (hours > 0) {
    return `${hours} saat ${minutes} dakika`;
  }

  if (minutes > 0) {
    return `${minutes} dakika ${seconds} saniye`;
  }

  return `${seconds} saniye`;
}

// ================================================
// HOOK
// ================================================

/**
 * Auto-acceptance countdown hook
 * Calculates remaining time until milestone is auto-accepted (72 hours after delivery)
 *
 * @param deliveredAt - ISO date string when milestone was delivered
 * @param status - Current milestone status
 * @returns Countdown time object with formatted display
 *
 * @example
 * ```tsx
 * const countdown = useAutoAcceptanceCountdown(
 *   milestone.deliveredAt,
 *   milestone.status
 * );
 *
 * if (!countdown.isExpired && milestone.status === 'DELIVERED') {
 *   return <Badge>Otomatik onay: {countdown.formattedTime}</Badge>;
 * }
 * ```
 */
export function useAutoAcceptanceCountdown(
  deliveredAt: string | null | undefined,
  status: string
): CountdownTime | null {
  // Only calculate countdown for delivered milestones
  const shouldCalculate = deliveredAt && status === 'DELIVERED';

  // Calculate auto-accept date (72 hours after delivery)
  const autoAcceptDate = useMemo(() => {
    if (!shouldCalculate) return null;

    const delivered = new Date(deliveredAt);
    const autoAccept = new Date(delivered);
    autoAccept.setHours(autoAccept.getHours() + AUTO_ACCEPT_HOURS);
    return autoAccept;
  }, [deliveredAt, shouldCalculate]);

  // State for countdown
  const [countdown, setCountdown] = useState<CountdownTime | null>(() =>
    autoAcceptDate ? calculateRemaining(autoAcceptDate) : null
  );

  // Update countdown every second
  useEffect(() => {
    if (!autoAcceptDate) {
      setCountdown(null);
      return;
    }

    // Initial calculation
    setCountdown(calculateRemaining(autoAcceptDate));

    // Update every second
    const interval = setInterval(() => {
      const remaining = calculateRemaining(autoAcceptDate);
      setCountdown(remaining);

      // Stop updating when expired
      if (remaining.isExpired) {
        clearInterval(interval);
      }
    }, MILLISECONDS_IN_SECOND);

    return () => clearInterval(interval);
  }, [autoAcceptDate]);

  return countdown;
}

/**
 * Check if milestone is close to auto-acceptance (< 24 hours remaining)
 */
export function useIsCloseToAutoAccept(
  deliveredAt: string | null | undefined,
  status: string
): boolean {
  const countdown = useAutoAcceptanceCountdown(deliveredAt, status);

  if (!countdown || countdown.isExpired) {
    return false;
  }

  // Consider "close" if less than 24 hours remaining
  const HOURS_THRESHOLD = 24;
  return countdown.hours < HOURS_THRESHOLD;
}

export default useAutoAcceptanceCountdown;
