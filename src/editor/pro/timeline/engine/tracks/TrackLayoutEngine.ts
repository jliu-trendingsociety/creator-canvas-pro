/**
 * TrackLayoutEngine
 * Manages vertical stacking and layout calculations
 */
import { Track } from '../../state/timelineStore';
import { TrackEngine } from './TrackEngine';

export interface TrackLayout {
  trackId: string;
  yOffset: number;
  height: number;
  type: Track['type'];
}

export class TrackLayoutEngine {
  /**
   * Calculate layout for all tracks
   */
  static calculateLayout(tracks: Track[]): TrackLayout[] {
    let currentY = 0;
    return tracks.map((track) => {
      const layout: TrackLayout = {
        trackId: track.id,
        yOffset: currentY,
        height: track.height,
        type: track.type,
      };
      currentY += track.height;
      return layout;
    });
  }

  /**
   * Get layout for specific track
   */
  static getTrackLayout(tracks: Track[], trackId: string): TrackLayout | null {
    const layouts = this.calculateLayout(tracks);
    return layouts.find((l) => l.trackId === trackId) || null;
  }

  /**
   * Calculate hitmap for track interaction
   */
  static createHitmap(
    tracks: Track[]
  ): Array<{ trackId: string; yStart: number; yEnd: number }> {
    let currentY = 0;
    return tracks.map((track) => {
      const hitmap = {
        trackId: track.id,
        yStart: currentY,
        yEnd: currentY + track.height,
      };
      currentY += track.height;
      return hitmap;
    });
  }

  /**
   * Find track at Y coordinate using hitmap
   */
  static findTrackAtY(
    hitmap: ReturnType<typeof TrackLayoutEngine.createHitmap>,
    y: number
  ): string | null {
    const hit = hitmap.find((h) => y >= h.yStart && y < h.yEnd);
    return hit?.trackId || null;
  }
}
