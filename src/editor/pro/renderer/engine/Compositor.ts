import { TrackRenderer } from "./TrackRenderer";
import { RenderFrameInput, TimelineTrackData } from "./types";

export class Compositor {
  private trackRenderer = new TrackRenderer();

  async prepareAssets(tracks: TimelineTrackData[], renderContext: any) {
    await this.trackRenderer.ensureAssetsLoaded(tracks, renderContext);
  }

  renderFrame(input: RenderFrameInput) {
    const { ctx, tracks } = input;

    ctx.clearRect(0, 0, input.width, input.height);

    const sorted = [...tracks].sort((a, b) => {
      const layerA = a.startTime;
      const layerB = b.startTime;
      return layerA - layerB;
    });

    for (const track of sorted) {
      this.trackRenderer.renderTrack(track, input);
    }
  }
}
