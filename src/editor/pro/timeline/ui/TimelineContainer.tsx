import { useEffect, useRef } from "react";
import { useTimelineStore } from "../state/timelineStore";
import { VideoTrack } from "./Track";
import { TimelineTrackRow } from "./TimelineTrackRow";
import { ZoomControls } from "./ZoomControls";
import { Playhead } from "./Playhead";
import { TrackLayoutEngine } from "../engine/tracks/TrackLayoutEngine";

interface TimelineContainerProps {
  thumbnails: string[];
  currentTime: number;
  duration: number;
  startFrame: number;
  endFrame: number;
  onSeek: (time: number) => void;
  onTrimChange: (start: number, end: number) => void;
}

export const TimelineContainer = ({
  thumbnails,
  currentTime,
  duration,
  startFrame,
  endFrame,
  onSeek,
  onTrimChange,
}: TimelineContainerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { tracks, setScrollLeft, resetTimeline } = useTimelineStore();

  // Calculate layouts for all tracks
  const trackLayouts = TrackLayoutEngine.calculateLayout(tracks);

  // Handle scroll updates
  const handleScroll = () => {
    if (containerRef.current) {
      setScrollLeft(containerRef.current.scrollLeft);
    }
  };

  // Reset timeline on unmount
  useEffect(() => {
    return () => {
      resetTimeline();
    };
  }, [resetTimeline]);

  // Update scroll position on resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setScrollLeft(containerRef.current.scrollLeft);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setScrollLeft]);

  // Multi-track mode
  if (tracks.length > 0) {
    const totalHeight = trackLayouts.reduce((sum, layout) => sum + layout.height, 0);
    
    return (
      <div className="flex-1 relative min-w-0">
        <ZoomControls containerRef={containerRef} />
        <div
          id="timeline-container"
          ref={containerRef}
          className="timeline-scroll relative bg-surface rounded-lg border border-border/30 overflow-x-auto"
          style={{ height: `${Math.max(totalHeight, 200)}px` }}
          onScroll={handleScroll}
        >
          {/* Render all tracks */}
          {trackLayouts.map((layout, index) => {
            const track = tracks.find((t) => t.id === layout.trackId);
            if (!track) return null;
            
            return (
              <TimelineTrackRow
                key={track.id}
                track={track}
                yOffset={layout.yOffset}
              />
            );
          })}
          
          {/* Playhead spans all tracks */}
          <Playhead currentTime={currentTime} duration={duration} height={totalHeight} />
        </div>
      </div>
    );
  }

  // Legacy single-track mode
  return (
    <div className="flex-1 relative min-w-0">
      <ZoomControls containerRef={containerRef} />
      <div
        id="timeline-container"
        ref={containerRef}
        className="timeline-scroll relative h-14 bg-surface rounded-lg border border-border/30"
        onScroll={handleScroll}
      >
        <VideoTrack
          thumbnails={thumbnails}
          currentTime={currentTime}
          duration={duration}
          startFrame={startFrame}
          endFrame={endFrame}
          onSeek={onSeek}
          onTrimChange={onTrimChange}
        />
      </div>
    </div>
  );
};
