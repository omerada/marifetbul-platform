# Notification Sounds

This directory contains audio files for notification alerts.

## Required Files

- `notification.mp3` - Default notification sound (gentle beep/chime)

## Usage

The notification sound is played when:

- New moderation items arrive (comments, flags)
- Urgent items require attention
- User has enabled sound notifications in preferences

## File Format

- Format: MP3
- Recommended: Short duration (0.5-2 seconds)
- Volume: Pre-normalized to comfortable level
- Bitrate: 128kbps or higher

## Adding Custom Sounds

To add a custom notification sound:

1. Add MP3 file to this directory
2. Update `useModerationNotifications` hook to reference new file
3. Test in different browsers (Chrome, Firefox, Safari, Edge)

## Browser Compatibility

MP3 format is supported in all major browsers:

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

## Note

**Placeholder:** The actual notification sound file (`notification.mp3`) should be added by the design team.
For now, the hook will attempt to load it but will fail silently if the file doesn't exist.

Recommended sources for free notification sounds:

- https://notificationsounds.com/
- https://freesound.org/
- https://zapsplat.com/

Look for short, pleasant alert sounds that are not jarring or annoying with repeated plays.
