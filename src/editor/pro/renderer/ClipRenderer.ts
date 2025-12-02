/**
 * ClipRenderer
 * Handles rendering individual clips with trim and offset support
 */
import { RenderClipNode } from './types';

export class ClipRenderer {
  /**
   * Prepare a clip for rendering
   */
  static prepareClip(node: RenderClipNode): {
    startTime: number;
    endTime: number;
    sourceOffset: number;
    duration: number;
  } {
    return {
      startTime: node.atTime,
      endTime: node.atTime + node.duration,
      sourceOffset: node.trimOffset,
      duration: node.duration,
    };
  }

  /**
   * Calculate which frame of the source should be shown at timeline time
   */
  static getSourceFrameAtTime(node: RenderClipNode, timelineTime: number): number {
    if (timelineTime < node.atTime || timelineTime >= node.atTime + node.duration) {
      return -1; // Clip not active at this time
    }

    const relativeTime = timelineTime - node.atTime;
    return node.trimOffset + relativeTime;
  }

  /**
   * Check if clip is active at a given time
   */
  static isActiveAtTime(node: RenderClipNode, time: number): boolean {
    return time >= node.atTime && time < node.atTime + node.duration;
  }

  /**
   * Apply effects to clip (stub for Phase 1)
   */
  static applyEffects(node: RenderClipNode, frame: ImageData): ImageData {
    // TODO: Implement effect application in Phase 2
    return frame;
  }
}
