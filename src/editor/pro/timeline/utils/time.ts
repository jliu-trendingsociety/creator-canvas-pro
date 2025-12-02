/**
 * Time Utilities
 * Formatting and conversion helpers
 */

/**
 * Format seconds to MM:SS or HH:MM:SS
 */
export const formatTime = (seconds: number): string => {
  if (!isFinite(seconds) || seconds < 0) return '00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format seconds to fractional format (MM:SS.mmm)
 */
export const formatTimeWithMillis = (seconds: number): string => {
  if (!isFinite(seconds) || seconds < 0) return '00:00.000';
  
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds % 1) * 1000);
  
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
};

/**
 * Convert frame number to time
 */
export const frameToTime = (frame: number, fps: number): number => {
  if (fps === 0) return 0;
  return frame / fps;
};

/**
 * Convert time to frame number
 */
export const timeToFrame = (time: number, fps: number): number => {
  return Math.floor(time * fps);
};

/**
 * Get FPS from duration and frame count
 */
export const calculateFPS = (duration: number, frameCount: number): number => {
  if (duration === 0) return 30; // Default to 30fps
  return frameCount / duration;
};
