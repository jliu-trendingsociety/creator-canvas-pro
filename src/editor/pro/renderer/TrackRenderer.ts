/**
 * TrackRenderer
 * Handles rendering logic for individual track types
 */
import { Track, Clip } from '../timeline/state/timelineStore';
import { RenderClipNode } from './types';

export class TrackRenderer {
  /**
   * Evaluate a track and return render nodes
   */
  static evaluateTrack(track: Track, trackIndex: number): RenderClipNode[] {
    const nodes: RenderClipNode[] = [];

    track.clips.forEach((clip) => {
      const node = this.evaluateClip(clip, track.id, track.type, trackIndex);
      if (node) nodes.push(node);
    });

    return nodes;
  }

  /**
   * Evaluate a single clip
   */
  static evaluateClip(
    clip: Clip,
    trackId: string,
    trackType: Track['type'],
    zIndex: number
  ): RenderClipNode | null {
    const clipDuration = clip.end - clip.start;

    if (clipDuration <= 0) {
      console.warn(`Invalid clip duration for clip ${clip.id}`);
      return null;
    }

    return {
      atTime: clip.start,
      type: trackType,
      source: clip.src,
      trackId,
      clipId: clip.id,
      trimOffset: clip.offset || 0,
      duration: clipDuration,
      zIndex,
    };
  }

  /**
   * Check if track type is supported
   */
  static isSupported(trackType: Track['type']): boolean {
    // Phase 1: video is fully supported, others are stubs
    return trackType === 'video';
  }
}
