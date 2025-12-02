import { useEffect } from "react";
import { ThumbnailStrip } from "./ThumbnailStrip";
import { TrimHandles } from "./TrimHandles";
import { Clip } from "./Clip";
import { useTimelineStore } from "../state/timelineStore";

interface VideoTrackProps {
  thumbnails: string[];
  currentTime: number;
  duration: number;
  startFrame: number;
  endFrame: number;
  onSeek: (time: number) => void;
  onTrimChange: (start: number, end: number) => void;
  videoSrc?: string;
}

export const VideoTrack = ({
  thumbnails,
  currentTime,
  duration,
  startFrame,
  endFrame,
  onSeek,
  onTrimChange,
  videoSrc,
}: VideoTrackProps) => {
  const { zoom, totalThumbnailWidth, tracks, addClip } = useTimelineStore();
  
  // Auto-create clip when video is loaded
  useEffect(() => {
    if (videoSrc && duration > 0 && tracks.length === 0) {
      // Initialize first track if it doesn't exist
      const videoTrackId = 'video-track-1';
      const clipId = `clip-${Date.now()}`;
      
      // Add a track and clip
      useTimelineStore.setState({
        tracks: [{
          id: videoTrackId,
          type: 'video',
          height: 80,
          clips: [{
            id: clipId,
            src: videoSrc,
            start: 0,
            end: duration,
            offset: 0,
            effects: [],
          }],
          locked: false,
          visible: true,
        }]
      });
    }
  }, [videoSrc, duration, tracks.length]);
  
  const baseThumbnailWidth = 80;
  const thumbnailWidth = baseThumbnailWidth * zoom;
  
  // Get video track
  const videoTrack = tracks.find(t => t.type === 'video');
  
  return (
    <div className="absolute inset-0">
      {/* Thumbnail strip as background */}
      <ThumbnailStrip
        thumbnails={thumbnails}
        duration={duration}
        currentTime={currentTime}
        startFrame={startFrame}
        endFrame={endFrame}
        onSeek={onSeek}
      />
      
      {/* Render clips on top */}
      {videoTrack?.clips.map((clip) => (
        <Clip
          key={clip.id}
          clip={clip}
          trackId={videoTrack.id}
          duration={duration}
          totalWidth={totalThumbnailWidth}
          zoom={zoom}
          currentTime={currentTime}
        />
      ))}
      
      {/* Legacy trim handles - can be removed once clip trimming is working */}
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
