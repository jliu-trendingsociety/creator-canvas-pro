export type TrackType = "video" | "audio" | "image";

export interface TimelineTrackData {
  id: string;
  type: TrackType;
  startTime: number;
  endTime: number;
  src: string; // video URL, image URL, audio URL
}

export interface RenderContext {
  videoElements: Map<string, HTMLVideoElement>;
  imageElements: Map<string, HTMLImageElement>;
}

export interface RenderFrameInput {
  ctx: CanvasRenderingContext2D;
  currentTime: number;
  width: number;
  height: number;
  tracks: TimelineTrackData[];
  renderContext: RenderContext;
}
