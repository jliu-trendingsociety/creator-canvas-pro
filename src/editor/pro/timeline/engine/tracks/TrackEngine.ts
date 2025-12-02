/**
 * TrackEngine
 * Manages track-level operations and vertical positioning
 */
import { Track } from '../../state/timelineStore';

export class TrackEngine {
  /**
   * Calculate vertical offset for a track by index
   */
  static getTrackYOffset(tracks: Track[], trackIndex: number): number {
    let yOffset = 0;
    for (let i = 0; i < trackIndex; i++) {
      yOffset += tracks[i]?.height || 0;
    }
    return yOffset;
  }

  /**
   * Get total timeline height (sum of all track heights)
   */
  static getTotalHeight(tracks: Track[]): number {
    return tracks.reduce((sum, track) => sum + track.height, 0);
  }

  /**
   * Find track by Y coordinate
   */
  static getTrackAtY(tracks: Track[], y: number): Track | null {
    let currentY = 0;
    for (const track of tracks) {
      if (y >= currentY && y < currentY + track.height) {
        return track;
      }
      currentY += track.height;
    }
    return null;
  }

  /**
   * Get track index by ID
   */
  static getTrackIndex(tracks: Track[], trackId: string): number {
    return tracks.findIndex((t) => t.id === trackId);
  }
}
