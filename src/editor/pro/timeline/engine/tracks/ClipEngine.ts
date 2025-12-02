/**
 * ClipEngine
 * Manages clip positioning, validation, and collision detection
 */
import { Clip } from '../../state/timelineStore';
import { timeToPx } from '../../core/coordinateSystem';

export class ClipEngine {
  /**
   * Calculate pixel position for a clip
   */
  static getClipPosition(
    clip: Clip,
    duration: number,
    totalWidth: number,
    zoom: number
  ): { left: number; width: number } {
    const left = timeToPx(clip.start, { duration, totalWidth, zoom });
    const right = timeToPx(clip.end, { duration, totalWidth, zoom });
    return {
      left,
      width: Math.max(1, right - left),
    };
  }

  /**
   * Check if two clips overlap in time
   */
  static clipsOverlap(clip1: Clip, clip2: Clip): boolean {
    return clip1.start < clip2.end && clip1.end > clip2.start;
  }

  /**
   * Validate clip placement (no overlap with existing clips)
   */
  static canPlaceClip(clip: Clip, existingClips: Clip[]): boolean {
    return !existingClips.some(
      (existing) => existing.id !== clip.id && this.clipsOverlap(clip, existing)
    );
  }

  /**
   * Find nearest snap point for clip placement
   */
  static findSnapPoint(
    targetTime: number,
    existingClips: Clip[],
    snapThreshold: number = 0.1
  ): number {
    const snapPoints: number[] = [0];
    existingClips.forEach((clip) => {
      snapPoints.push(clip.start, clip.end);
    });

    const nearest = snapPoints.reduce((prev, curr) =>
      Math.abs(curr - targetTime) < Math.abs(prev - targetTime) ? curr : prev
    );

    return Math.abs(nearest - targetTime) < snapThreshold ? nearest : targetTime;
  }

  /**
   * Get clip duration
   */
  static getClipDuration(clip: Clip): number {
    return clip.end - clip.start;
  }
}
