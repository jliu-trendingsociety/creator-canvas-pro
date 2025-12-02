/**
 * RenderEngine
 * Main orchestrator for multi-track rendering
 */
import { Track } from '../timeline/state/timelineStore';
import { RenderGraph } from './RenderGraph';
import { TrackRenderer } from './TrackRenderer';
import { VideoCompositor } from './VideoCompositor';
import { FFmpegService } from './FFmpegService';
import { RenderGraphOutput, RenderOptions } from './types';

export class RenderEngine {
  private compositor: VideoCompositor | null = null;
  private ffmpeg: FFmpegService;

  constructor() {
    this.ffmpeg = new FFmpegService();
  }

  /**
   * Evaluate timeline and build render graph
   */
  evaluateTimeline(tracks: Track[], duration: number): RenderGraphOutput {
    console.log('[RenderEngine] Evaluating timeline with', tracks.length, 'tracks');

    // Build render graph from all tracks
    const graph = RenderGraph.build(tracks, duration);

    // Validate graph
    const validation = RenderGraph.validate(graph);
    if (!validation.valid) {
      console.error('[RenderEngine] Validation errors:', validation.errors);
    }

    console.log('[RenderEngine] Render graph generated:', graph);
    return graph;
  }

  /**
   * Initialize compositor with resolution
   */
  initCompositor(width: number, height: number): void {
    this.compositor = new VideoCompositor(width, height);
    console.log('[RenderEngine] Compositor initialized at', width, 'x', height);
  }

  /**
   * Render preview (stub)
   */
  async renderPreview(graph: RenderGraphOutput): Promise<void> {
    console.log('[RenderEngine] Rendering preview for', graph.nodes.length, 'clips');

    // TODO: Implement preview rendering
    // For each frame:
    //   1. Get active clips at time
    //   2. Load frames from sources
    //   3. Composite frames using VideoCompositor
    //   4. Display in preview canvas
  }

  /**
   * Export final video (stub)
   */
  async exportVideo(
    graph: RenderGraphOutput,
    options: RenderOptions
  ): Promise<Blob | null> {
    console.log('[RenderEngine] Exporting video with options:', options);

    // Initialize FFmpeg if needed
    if (!this.ffmpeg.isReady()) {
      await this.ffmpeg.init();
    }

    // TODO: Implement full export pipeline
    // 1. Attach all source files
    // 2. Build filter chains for composition
    // 3. Run FFmpeg export
    // 4. Return output blob

    return this.ffmpeg.export(options);
  }

  /**
   * Get compositor instance
   */
  getCompositor(): VideoCompositor | null {
    return this.compositor;
  }
}
