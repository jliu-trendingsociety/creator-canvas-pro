/**
 * Renderer Type Definitions
 */

export type TrackType = 'video' | 'audio' | 'effect' | 'text';

export interface RenderClipNode {
  atTime: number;
  type: TrackType;
  source: string;
  trackId: string;
  clipId: string;
  trimOffset: number;
  duration: number;
  zIndex: number;
}

export interface RenderGraphOutput {
  duration: number;
  nodes: RenderClipNode[];
  trackCount: number;
}

export interface CompositeFrame {
  timestamp: number;
  data: ImageData | null;
}

export interface RenderOptions {
  resolution: { width: number; height: number };
  fps: number;
  format: 'mp4' | 'webm';
}
