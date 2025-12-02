import { ThumbnailStrip } from "./ThumbnailStrip";
import { Playhead } from "./Playhead";
import { TrimHandles } from "./TrimHandles";
import { useTimelineStore } from "../state/timelineStore";

interface VideoTrackProps {
  thumbnails: string[];
  currentTime: number;
  duration: number;
  startFrame: number;
  endFrame: number;
  onSeek: (time: number) => void;
  onTrimChange: (start: number, end: number) => void;
}

export const VideoTrack = ({
  thumbnails,
  currentTime,
  duration,
  startFrame,
  endFrame,
  onSeek,
  onTrimChange,
}: VideoTrackProps) => {
  const { zoom } = useTimelineStore();
  const baseThumbnailWidth = 80;
  const thumbnailWidth = baseThumbnailWidth * zoom;
  return (
    <div className="relative h-14">
      <ThumbnailStrip
        thumbnails={thumbnails}
        duration={duration}
        currentTime={currentTime}
        startFrame={startFrame}
        endFrame={endFrame}
        onSeek={onSeek}
      />
      <Playhead currentTime={currentTime} duration={duration} />
      <TrimHandles
        startFrame={startFrame}
        endFrame={endFrame}
        duration={duration}
        thumbnailCount={thumbnails.length}
        thumbnailWidth={thumbnailWidth}
        onTrimChange={onTrimChange}
        onSeek={onSeek}
      />
    </div>
  );
};
