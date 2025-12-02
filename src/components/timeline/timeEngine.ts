/**
 * Time Engine Module
 * Manages time state and provides time-related utilities
 * This is NOT a React component - it provides pure functions
 */

export interface TimeState {
  currentTime: number;
  startFrame: number;
  endFrame: number;
  duration: number;
}

/**
 * Format time in MM:SS format
 */
export const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

/**
 * Calculate duration from start to end frame
 */
export const getTrimmedDuration = (startFrame: number, endFrame: number): number => {
  return Math.max(0, endFrame - startFrame);
};

/**
 * Check if a time is within the trimmed range
 */
export const isTimeInRange = (time: number, startFrame: number, endFrame: number): boolean => {
  return time >= startFrame && time <= endFrame;
};

/**
 * Snap time to nearest frame based on FPS
 */
export const snapToFrame = (time: number, fps: number = 30): number => {
  const frameTime = 1 / fps;
  return Math.round(time / frameTime) * frameTime;
};
