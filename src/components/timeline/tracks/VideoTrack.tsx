import { ThumbnailStrip } from "../ui/ThumbnailStrip";
import { Playhead } from "../ui/Playhead";
import { TrimHandles } from "../ui/TrimHandles";

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
  return (
    <div className="relative h-16">
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
        onTrimChange={onTrimChange}
        onSeek={onSeek}
      />
    </div>
  );
};
