import { useEffect, useRef } from "react";
import { useTimelineStore } from "./timelineStore";
import { VideoTrack } from "./tracks/VideoTrack";
import { ZoomControls } from "./ui/ZoomControls";

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
  const { setScrollLeft, resetTimeline } = useTimelineStore();

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
