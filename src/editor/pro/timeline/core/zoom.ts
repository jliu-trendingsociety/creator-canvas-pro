/**
 * Zoom Management
 * Handles zoom levels and scroll preservation
 */

export const ZOOM_MIN = 0.2;
export const ZOOM_MAX = 4.0;
export const ZOOM_STEP = 0.2;

export const zoomLevels = [0.25, 0.5, 0.75, 1.0, 1.5, 2.0, 3.0, 4.0];

/**
 * Get nearest zoom level from predefined steps
 */
export const getNearestZoomLevel = (zoom: number): number => {
  return zoomLevels.reduce((prev, curr) =>
    Math.abs(curr - zoom) < Math.abs(prev - zoom) ? curr : prev
  );
};

/**
 * Calculate new scroll position to maintain viewport center during zoom
 */
export const calculateZoomScroll = (
  currentScroll: number,
  viewportWidth: number,
  oldZoom: number,
  newZoom: number
): number => {
  if (oldZoom === 0) return currentScroll;
  
  // Calculate center point in the old zoom
  const centerX = currentScroll + viewportWidth / 2;
  const centerRatio = centerX / oldZoom;
  
  // Calculate new scroll to keep center point at same position
  const newCenterX = centerRatio * newZoom;
  const newScroll = newCenterX - viewportWidth / 2;
  
  return Math.max(0, Math.round(newScroll));
};

/**
 * Clamp zoom to valid range
 */
export const clampZoom = (zoom: number): number => {
  return Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoom));
};
