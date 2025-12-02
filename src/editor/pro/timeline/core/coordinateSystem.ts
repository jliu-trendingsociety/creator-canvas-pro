/**
 * UNIFIED TIMELINE COORDINATE SYSTEM
 * Single source of truth for all time ↔ pixel conversions
 * All timeline components MUST use these functions
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
 * Calculate pixels per second based on zoom and total width
 * This is the fundamental unit of the coordinate system
 */
export const getPixelsPerSecond = (
  duration: number,
  totalWidth: number,
  zoom: number = 1
): number => {
  if (duration === 0) return 0;
  return Math.round((totalWidth / duration) * zoom);
};

/**
 * Convert time (seconds) to pixel position
 * ALWAYS returns integer pixels to prevent sub-pixel drift
 * Used by: ruler ticks, playhead, clip positioning, thumbnails
 */
export const timeToPx = (
  time: number,
  { duration, totalWidth, zoom = 1 }: CoordinateSystemParams
): number => {
  if (duration === 0 || totalWidth === 0) return 0;
  const pixelsPerSecond = getPixelsPerSecond(duration, totalWidth, zoom);
  return Math.round(time * pixelsPerSecond);
};

/**
 * Convert pixel position to time (seconds)
 * Accounts for scroll offset
 * Used by: click detection, scrubbing, drag operations
 */
export const pxToTime = (
  px: number,
  { duration, totalWidth, zoom = 1, scrollLeft = 0 }: CoordinateSystemParams
): number => {
  if (totalWidth === 0 || duration === 0) return 0;
  const pixelsPerSecond = getPixelsPerSecond(duration, totalWidth, zoom);
  const adjustedPx = px + (scrollLeft || 0);
  return adjustedPx / pixelsPerSecond;
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
  { duration, totalWidth, zoom = 1, scrollLeft = 0 }: CoordinateSystemParams,
  viewportWidth: number
): { start: number; end: number } => {
  const start = pxToTime(scrollLeft, { duration, totalWidth, zoom });
  const end = pxToTime(scrollLeft + viewportWidth, { duration, totalWidth, zoom });
  return { start, end };
};

/**
 * Convert thumbnail index to pixel position
 * ALWAYS returns integer pixels
 * Used for: thumbnail positioning, highlight boxes, selection rectangles
 */
export const indexToPx = (index: number, thumbnailWidth: number): number => {
  return Math.round(index * thumbnailWidth + TIMELINE_LEFT_OFFSET);
};

/**
 * Convert pixel position to thumbnail index
 * Used for: click detection, hover interactions
 */
export const pxToIndex = (px: number, thumbnailWidth: number): number => {
  return Math.floor((px - TIMELINE_LEFT_OFFSET) / thumbnailWidth);
};

/**
 * VERTICAL COORDINATE SYSTEM
 * For multi-track vertical positioning
 */

/**
 * Convert track index to Y offset
 * ALWAYS returns integer pixels
 */
export const trackIndexToY = (trackIndex: number, trackHeights: number[]): number => {
  let yOffset = 0;
  for (let i = 0; i < trackIndex; i++) {
    yOffset += trackHeights[i] || 0;
  }
  return Math.round(yOffset);
};

/**
 * Convert Y coordinate to track index
 */
export const yToTrackIndex = (y: number, trackHeights: number[]): number => {
  let currentY = 0;
  for (let i = 0; i < trackHeights.length; i++) {
    if (y >= currentY && y < currentY + trackHeights[i]) {
      return i;
    }
    currentY += trackHeights[i];
  }
  return -1;
};
