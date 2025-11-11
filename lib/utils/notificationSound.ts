/**
 * Notification Sound Utility
 *
 * Handles playing notification sounds with proper error handling
 * and respecting user preferences.
 */

import logger from '@/lib/infrastructure/monitoring/logger';

/**
 * Play notification sound
 * @param volume - Volume level (0.0 to 1.0)
 */
export function playNotificationSound(volume: number = 0.5): void {
  try {
    // Check if Audio API is available
    if (typeof Audio === 'undefined') {
      logger.warn('Audio API not available in this environment');
      return;
    }

    // Create audio instance
    const audio = new Audio('/sounds/notification.mp3');
    audio.volume = Math.max(0, Math.min(1, volume)); // Clamp between 0 and 1

    // Play sound
    const playPromise = audio.play();

    // Handle promise (required by some browsers)
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          logger.debug('Notification sound played successfully');
        })
        .catch((error) => {
          // User hasn't interacted with document yet (autoplay policy)
          logger.warn('Could not play notification sound:', error.message);
        });
    }
  } catch (error) {
    logger.error('Error playing notification sound:', error);
  }
}

/**
 * Vibrate device (mobile only)
 * @param pattern - Vibration pattern in milliseconds
 */
export function vibrateDevice(pattern: number | number[] = 200): void {
  try {
    // Check if Vibration API is available
    if (!navigator.vibrate) {
      logger.debug('Vibration API not available');
      return;
    }

    // Vibrate
    const success = navigator.vibrate(pattern);

    if (success) {
      logger.debug('Device vibrated successfully');
    }
  } catch (error) {
    logger.error('Error vibrating device:', error);
  }
}

/**
 * Check if Do Not Disturb mode is active
 * @param dndEnabled - Is DND enabled
 * @param startTime - DND start time (HH:mm format)
 * @param endTime - DND end time (HH:mm format)
 * @returns true if currently in DND period
 */
export function isDoNotDisturb(
  dndEnabled: boolean,
  startTime?: string,
  endTime?: string
): boolean {
  if (!dndEnabled || !startTime || !endTime) {
    return false;
  }

  try {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute; // Minutes since midnight

    // Parse start time
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const start = startHour * 60 + startMinute;

    // Parse end time
    const [endHour, endMinute] = endTime.split(':').map(Number);
    const end = endHour * 60 + endMinute;

    // Handle DND spanning midnight (e.g., 22:00 - 08:00)
    if (start > end) {
      return currentTime >= start || currentTime < end;
    }

    // Normal DND period (e.g., 13:00 - 14:00)
    return currentTime >= start && currentTime < end;
  } catch (error) {
    logger.error('Error checking DND status:', error);
    return false;
  }
}

/**
 * Play notification with sound and vibration based on preferences
 * @param preferences - User notification preferences
 */
export function playNotificationAlert(preferences: {
  sound?: boolean;
  vibration?: boolean;
  doNotDisturb?: boolean;
  dndStartTime?: string;
  dndEndTime?: string;
}): void {
  // Check if DND is active
  const isDND = isDoNotDisturb(
    preferences.doNotDisturb ?? false,
    preferences.dndStartTime,
    preferences.dndEndTime
  );

  if (isDND) {
    logger.debug('Do Not Disturb mode active, skipping notification alert');
    return;
  }

  // Play sound if enabled
  if (preferences.sound !== false) {
    playNotificationSound();
  }

  // Vibrate if enabled
  if (preferences.vibration !== false) {
    vibrateDevice();
  }
}
