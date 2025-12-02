/**
 * Coordinate System Module
 * Handles all time ↔ pixel conversions for the timeline
 * Uses real scrollable thumbnail width, not container width
 */

export interface CoordinateSystemParams {
  duration: number;
  totalWidth: number;
  zoom?: number;
  scrollLeft?: number;
}

// Timeline coordinate offset - applied uniformly to all positioned elements
export const TIMELINE_LEFT_OFFSET = 0;

/**
 * Convert time (seconds) to pixel position
 * Always returns integer pixels to prevent sub-pixel drift
 */
export const timeToPx = (
  time: number,
  { duration, totalWidth, zoom = 1 }: CoordinateSystemParams
): number => {
  if (duration === 0 || totalWidth === 0) return 0;
  return Math.round((time / duration) * totalWidth * zoom);
};

/**
 * Convert pixel position to time (seconds)
 * Accounts for scroll offset
 */
export const pxToTime = (
  px: number,
  { duration, totalWidth, zoom = 1, scrollLeft = 0 }: CoordinateSystemParams
): number => {
  if (totalWidth === 0) return 0;
  const adjustedPx = px + scrollLeft;
  return (adjustedPx / (totalWidth * zoom)) * duration;
};

/**
 * Clamp time to valid range [0, duration]
 */
export const clampTime = (time: number, duration: number): number => {
  return Math.max(0, Math.min(time, duration));
};

/**
 * Get visible time range for the current viewport
 */
export const getVisibleTimeRange = (
  { duration, totalWidth, scrollLeft = 0 }: CoordinateSystemParams,
  viewportWidth: number
): { start: number; end: number } => {
  const start = pxToTime(scrollLeft, { duration, totalWidth });
  const end = pxToTime(scrollLeft + viewportWidth, { duration, totalWidth });
  return { start, end };
};
