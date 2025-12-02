import { RenderFrameInput, TimelineTrackData } from "./types";

export class TrackRenderer {
  async ensureAssetsLoaded(tracks: TimelineTrackData[], ctx: any) {
    const { videoElements, imageElements } = ctx;

    for (const track of tracks) {
      if (track.type === "video") {
        if (!videoElements.has(track.id)) {
          const v = document.createElement("video");
          v.src = track.src;
          v.crossOrigin = "anonymous";
          v.preload = "auto";
          await v.play().catch(() => {});
          v.pause();
          videoElements.set(track.id, v);
        }
      }

      if (track.type === "image") {
        if (!imageElements.has(track.id)) {
          const img = new Image();
          img.src = track.src;
          img.crossOrigin = "anonymous";
          await new Promise((resolve) => {
            img.onload = resolve;
          });
          imageElements.set(track.id, img);
        }
      }
    }
  }

  renderTrack(track: TimelineTrackData, input: RenderFrameInput) {
    const { ctx, currentTime, width, height, renderContext } = input;
    const { videoElements, imageElements } = renderContext;

    if (currentTime < track.startTime || currentTime > track.endTime) return;

    const localTime = currentTime - track.startTime;

    if (track.type === "video") {
      const v = videoElements.get(track.id);
      if (!v) return;
      v.currentTime = localTime;
      ctx.drawImage(v, 0, 0, width, height);
    }

    if (track.type === "image") {
      const img = imageElements.get(track.id);
      if (!img) return;
      ctx.drawImage(img, 0, 0, width, height);
    }

    if (track.type === "audio") {
      // Audio is controlled globally later. Not drawn to canvas.
      return;
    }
  }
}
