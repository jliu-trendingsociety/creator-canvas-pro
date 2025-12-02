/**
 * RenderGraph
 * Builds a scheduling graph from timeline tracks and clips
 */
import { Track, Clip } from '../timeline/state/timelineStore';
import { RenderClipNode, RenderGraphOutput } from './types';

export class RenderGraph {
  /**
   * Build render graph from timeline tracks
   */
  static build(tracks: Track[], duration: number): RenderGraphOutput {
    const nodes: RenderClipNode[] = [];

    // Process tracks in order (lower index = rendered first)
    tracks.forEach((track, trackIndex) => {
      track.clips.forEach((clip) => {
        // Compute absolute timing
        const clipDuration = clip.end - clip.start;
        const trimOffset = clip.offset || 0;

        // Register clip in render graph
        nodes.push({
          atTime: clip.start,
          type: track.type,
          source: clip.src,
          trackId: track.id,
          clipId: clip.id,
          trimOffset,
          duration: clipDuration,
          zIndex: trackIndex,
        });
      });
    });

    // Sort by time, then by zIndex (lower tracks first)
    nodes.sort((a, b) => {
      if (a.atTime !== b.atTime) return a.atTime - b.atTime;
      return a.zIndex - b.zIndex;
    });

    return {
      duration,
      nodes,
      trackCount: tracks.length,
    };
  }

  /**
   * Get active clips at a specific time
   */
  static getClipsAtTime(graph: RenderGraphOutput, time: number): RenderClipNode[] {
    return graph.nodes.filter((node) => {
      const clipEnd = node.atTime + node.duration;
      return time >= node.atTime && time < clipEnd;
    });
  }

  /**
   * Validate render graph
   */
  static validate(graph: RenderGraphOutput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (graph.nodes.length === 0) {
      errors.push('No clips to render');
    }

    if (graph.duration <= 0) {
      errors.push('Invalid duration');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
