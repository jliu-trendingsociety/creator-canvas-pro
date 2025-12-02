import { useEffect, useRef } from "react";
import { useTimelineStore } from "../state/timelineStore";
import { VideoTrack } from "./Track";
import { TimelineTrackRow } from "./TimelineTrackRow";
import { TimelineRuler } from "./TimelineRuler";
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

  // Clear selection when clicking empty space
  const handleContainerClick = () => {
    const { setSelectedClip } = useTimelineStore.getState();
    setSelectedClip(null);
  };

  // Multi-track mode
  if (tracks.length > 0) {
    const totalHeight = trackLayouts.reduce((sum, layout) => sum + layout.height, 0);
    const rulerHeight = 24; // Height of the ruler
    
    return (
      <div className="flex-1 relative min-w-0 flex flex-col">
        <ZoomControls containerRef={containerRef} />
        <TimelineRuler duration={duration} />
        <div
          id="timeline-container"
          ref={containerRef}
          className="timeline-scroll relative bg-surface rounded-b-lg border border-t-0 border-border/30 overflow-x-auto overflow-y-auto flex-1"
          style={{ maxHeight: `${Math.max(totalHeight + 40, 200)}px` }}
          onScroll={handleScroll}
          onClick={handleContainerClick}
        >
          <div className="relative" style={{ minHeight: `${totalHeight}px` }}>
            {/* Render all tracks */}
            {trackLayouts.map((layout) => {
              const track = tracks.find((t) => t.id === layout.trackId);
              if (!track) return null;
              
              return (
                <div
                  key={track.id}
                  className="absolute left-0 right-0"
                  style={{ top: `${layout.yOffset}px` }}
                >
                  <TimelineTrackRow
                    track={track}
                    yOffset={layout.yOffset}
                  />
                </div>
              );
            })}
            
            {/* Playhead spans all tracks */}
            <Playhead currentTime={currentTime} duration={duration} height={totalHeight} />
          </div>
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
