import { Compositor } from "./Compositor";
import { RenderFrameInput, TimelineTrackData, RenderContext } from "./types";

export class RenderEngine {
  private compositor = new Compositor();
  private renderContext: RenderContext = {
    videoElements: new Map(),
    imageElements: new Map(),
  };

  async prepare(tracks: TimelineTrackData[]) {
    await this.compositor.prepareAssets(tracks, this.renderContext);
  }

  renderFrame(input: Omit<RenderFrameInput, "renderContext">) {
    this.compositor.renderFrame({
      ...input,
      renderContext: this.renderContext,
    });
  }
}
