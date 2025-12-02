/**
 * Pixel Math Utilities
 * Pure functions for pixel-perfect calculations
 */

export const pixelMath = {
  /**
   * Clamp a value between min and max
   */
  clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  },

  /**
   * Round to nearest integer to avoid sub-pixel rendering
   */
  roundPx(value: number): number {
    return Math.round(value);
  },

  /**
   * Floor to integer for index calculations
   */
  floorPx(value: number): number {
    return Math.floor(value);
  },

  /**
   * Calculate percentage between two values
   */
  percentage(value: number, min: number, max: number): number {
    if (max === min) return 0;
    return ((value - min) / (max - min)) * 100;
  },

  /**
   * Linear interpolation
   */
  lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
  },

  /**
   * Inverse lerp - get t value for a point between start and end
   */
  inverseLerp(start: number, end: number, value: number): number {
    if (end === start) return 0;
    return (value - start) / (end - start);
  },
};
