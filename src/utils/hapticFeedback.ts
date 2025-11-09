// Haptic feedback utilities for mobile devices

// Check if vibration is supported
const isVibrationSupported = () => {
  return 'vibrate' in navigator;
};

// Light haptic feedback (for face detection)
export const hapticLight = () => {
  if (isVibrationSupported()) {
    try {
      navigator.vibrate(10); // Very short vibration
    } catch (err) {
      console.error('Error triggering haptic feedback:', err);
    }
  }
};

// Medium haptic feedback (for countdown ticks)
export const hapticMedium = () => {
  if (isVibrationSupported()) {
    try {
      navigator.vibrate(25);
    } catch (err) {
      console.error('Error triggering haptic feedback:', err);
    }
  }
};

// Success haptic feedback (for successful capture)
export const hapticSuccess = () => {
  if (isVibrationSupported()) {
    try {
      navigator.vibrate([50, 50, 100]); // Pattern: vibrate-pause-vibrate
    } catch (err) {
      console.error('Error triggering haptic feedback:', err);
    }
  }
};

// Check if haptic is available
export const isHapticAvailable = () => isVibrationSupported();
