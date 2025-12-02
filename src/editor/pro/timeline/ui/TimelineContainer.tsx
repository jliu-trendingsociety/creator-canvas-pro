import { useEffect, useRef } from "react";
import { useTimelineStore } from "../state/timelineStore";
import { VideoTrack } from "./Track";
import { TimelineTrackRow } from "./TimelineTrackRow";
import { TimelineRuler } from "./TimelineRuler";
import { ZoomControls } from "./ZoomControls";
import { Playhead } from "./Playhead";
import { TrackLayoutEngine } from "../engine/tracks/TrackLayoutEngine";
import { Video, Music } from "lucide-react";

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

  // Professional NLE Timeline Layout
  return (
    <div className="w-full h-full flex flex-col bg-background">
      {/* Timeline Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/30 bg-surface/50">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-neon tracking-wider">TIMELINE</span>
        </div>
        <ZoomControls containerRef={containerRef} />
      </div>

      {/* Time Ruler - Fixed at top, scrolls with content */}
      <TimelineRuler duration={duration} />

      {/* Track Area - Full Width Edge to Edge */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Track Headers Column (Fixed Left) */}
        <div className="w-40 flex-shrink-0 border-r border-border/30 bg-surface/30 relative z-10">
          {/* Video Track Header */}
          <div className="h-20 border-b border-border/20 px-3 py-2 flex items-center gap-2">
            <Video className="w-4 h-4 text-neon" />
            <div className="flex-1">
              <div className="text-xs font-medium text-foreground">Video</div>
              <div className="text-[10px] text-muted-foreground">V1</div>
            </div>
          </div>

          {/* Audio Track Header (Placeholder) */}
          <div className="h-16 border-b border-border/20 px-3 py-2 flex items-center gap-2 opacity-40">
            <Music className="w-4 h-4 text-muted-foreground" />
            <div className="flex-1">
              <div className="text-xs font-medium text-muted-foreground">Audio</div>
              <div className="text-[10px] text-muted-foreground">A1</div>
            </div>
          </div>
        </div>

        {/* Scrollable Track Lanes */}
        <div
          ref={containerRef}
          className="flex-1 overflow-x-auto overflow-y-hidden timeline-scroll relative bg-background/50"
          onScroll={handleScroll}
          onClick={handleContainerClick}
        >
          <div className="relative min-w-full">
            {/* Video Track Lane */}
            <div className="h-20 border-b border-border/20 relative">
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

            {/* Audio Track Lane (Placeholder) */}
            <div className="h-16 border-b border-border/20 relative bg-surface/10">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs text-muted-foreground/40">Audio track placeholder</span>
              </div>
            </div>

            {/* Playhead (spans all tracks) - positioned from ruler top */}
            <div className="absolute top-0 left-0 right-0 pointer-events-none" style={{ height: '136px' }}>
              <Playhead currentTime={currentTime} duration={duration} height={136} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
