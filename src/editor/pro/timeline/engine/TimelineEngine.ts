/**
 * TimelineEngine
 * Core rendering and coordinate calculation engine
 */
export class TimelineEngine {
  private registry: any;

  constructor(registry: any) {
    this.registry = registry;
  }

  /**
   * Convert time (seconds) to pixel position
   */
  toPixel(time: number, zoom: number, pxPerSecond: number): number {
    return Math.round(time * zoom * pxPerSecond);
  }

  /**
   * Convert pixel position to time (seconds)
   */
  toTime(pixel: number, zoom: number, pxPerSecond: number): number {
    if (pxPerSecond === 0) return 0;
    return pixel / (zoom * pxPerSecond);
  }

  /**
   * Get visible time range for viewport
   */
  getVisibleRange(scrollLeft: number, viewportWidth: number, zoom: number, pxPerSecond: number) {
    const startTime = this.toTime(scrollLeft, zoom, pxPerSecond);
    const endTime = this.toTime(scrollLeft + viewportWidth, zoom, pxPerSecond);
    return { startTime, endTime };
  }
}
