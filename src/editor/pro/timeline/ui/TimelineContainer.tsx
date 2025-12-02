import { useEffect, useRef, useState } from "react";
import { useTimelineStore } from "../state/timelineStore";
import { VideoTrack } from "./Track";
import { TimelineTrackRow } from "./TimelineTrackRow";
import { TimelineRuler } from "./TimelineRuler";
import { ZoomControls } from "./ZoomControls";
import { Playhead } from "./Playhead";
import { TrackLayoutEngine } from "../engine/tracks/TrackLayoutEngine";
import { Video, Music, ChevronDown, ChevronRight, Volume2, VolumeX, Eye, EyeOff, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  
  // Track collapse state
  const [collapsedTracks, setCollapsedTracks] = useState<Set<string>>(new Set());
  
  // Track mute/solo/lock state (placeholders)
  const [mutedTracks, setMutedTracks] = useState<Set<string>>(new Set());
  const [soloTracks, setSoloTracks] = useState<Set<string>>(new Set());
  const [lockedTracks, setLockedTracks] = useState<Set<string>>(new Set());

  // Calculate layouts for all tracks
  const trackLayouts = TrackLayoutEngine.calculateLayout(tracks);

  // Handle scroll updates
  const handleScroll = () => {
    if (containerRef.current) {
      setScrollLeft(containerRef.current.scrollLeft);
    }
  };
  
  // Toggle track collapsed state
  const toggleTrackCollapse = (trackId: string) => {
    setCollapsedTracks(prev => {
      const next = new Set(prev);
      if (next.has(trackId)) {
        next.delete(trackId);
      } else {
        next.add(trackId);
      }
      return next;
    });
  };
  
  // Get track height based on collapsed state
  const getTrackHeight = (trackId: string, defaultHeight: number) => {
    return collapsedTracks.has(trackId) ? 28 : defaultHeight;
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
        <div className="w-40 flex-shrink-0 border-r border-border/30 bg-surface/30 relative z-10 overflow-hidden">
          {/* Video Track Header */}
          <div 
            className="border-b border-border/20 px-2 py-2 flex flex-col gap-1 transition-all duration-300 ease-in-out overflow-hidden"
            style={{ height: `${getTrackHeight('video', 80)}px` }}
          >
            {/* Header row */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleTrackCollapse('video')}
                className="h-5 w-5 p-0 hover:bg-surface-elevated"
              >
                {collapsedTracks.has('video') ? (
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                )}
              </Button>
              <Video className="w-3.5 h-3.5 text-neon" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-foreground">Video</div>
                <div className="text-[9px] text-muted-foreground">V1</div>
              </div>
            </div>
            
            {/* Control buttons - only visible when expanded */}
            {!collapsedTracks.has('video') && (
              <div className="flex items-center gap-0.5 pl-6 animate-in fade-in duration-200">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMutedTracks(prev => {
                    const next = new Set(prev);
                    next.has('video') ? next.delete('video') : next.add('video');
                    return next;
                  })}
                  className={`h-6 w-6 p-0 hover:bg-surface-elevated ${mutedTracks.has('video') ? 'bg-destructive/20' : ''}`}
                  title="Mute/Unmute"
                >
                  {mutedTracks.has('video') ? (
                    <VolumeX className="w-3 h-3 text-destructive" />
                  ) : (
                    <Volume2 className="w-3 h-3 text-muted-foreground" />
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSoloTracks(prev => {
                    const next = new Set(prev);
                    next.has('video') ? next.delete('video') : next.add('video');
                    return next;
                  })}
                  className={`h-6 w-6 p-0 hover:bg-surface-elevated ${soloTracks.has('video') ? 'bg-neon/20' : ''}`}
                  title="Solo"
                >
                  {soloTracks.has('video') ? (
                    <Eye className="w-3 h-3 text-neon" />
                  ) : (
                    <EyeOff className="w-3 h-3 text-muted-foreground" />
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLockedTracks(prev => {
                    const next = new Set(prev);
                    next.has('video') ? next.delete('video') : next.add('video');
                    return next;
                  })}
                  className={`h-6 w-6 p-0 hover:bg-surface-elevated ${lockedTracks.has('video') ? 'bg-accent/20' : ''}`}
                  title="Lock/Unlock"
                >
                  {lockedTracks.has('video') ? (
                    <Lock className="w-3 h-3 text-accent" />
                  ) : (
                    <Unlock className="w-3 h-3 text-muted-foreground" />
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Audio Track Header (Placeholder) */}
          <div 
            className="border-b border-border/20 px-2 py-2 flex flex-col gap-1 opacity-40 transition-all duration-300 ease-in-out overflow-hidden"
            style={{ height: `${getTrackHeight('audio', 64)}px` }}
          >
            {/* Header row */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleTrackCollapse('audio')}
                className="h-5 w-5 p-0 hover:bg-surface-elevated"
              >
                {collapsedTracks.has('audio') ? (
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                )}
              </Button>
              <Music className="w-3.5 h-3.5 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-muted-foreground">Audio</div>
                <div className="text-[9px] text-muted-foreground">A1</div>
              </div>
            </div>
            
            {/* Control buttons - only visible when expanded */}
            {!collapsedTracks.has('audio') && (
              <div className="flex items-center gap-0.5 pl-6 animate-in fade-in duration-200">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-surface-elevated"
                  title="Mute/Unmute"
                >
                  <Volume2 className="w-3 h-3 text-muted-foreground" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-surface-elevated"
                  title="Solo"
                >
                  <EyeOff className="w-3 h-3 text-muted-foreground" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-surface-elevated"
                  title="Lock/Unlock"
                >
                  <Unlock className="w-3 h-3 text-muted-foreground" />
                </Button>
              </div>
            )}
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
            <div 
              className="border-b border-border/20 relative transition-all duration-300 ease-in-out overflow-hidden"
              style={{ height: `${getTrackHeight('video', 80)}px` }}
            >
              {!collapsedTracks.has('video') && (
                <VideoTrack
                  thumbnails={thumbnails}
                  currentTime={currentTime}
                  duration={duration}
                  startFrame={startFrame}
                  endFrame={endFrame}
                  onSeek={onSeek}
                  onTrimChange={onTrimChange}
                />
              )}
            </div>

            {/* Audio Track Lane (Placeholder) */}
            <div 
              className="border-b border-border/20 relative bg-surface/10 transition-all duration-300 ease-in-out overflow-hidden"
              style={{ height: `${getTrackHeight('audio', 64)}px` }}
            >
              {!collapsedTracks.has('audio') && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs text-muted-foreground/40">Audio track placeholder</span>
                </div>
              )}
            </div>

            {/* Playhead (spans all tracks) - positioned from ruler top */}
            <div 
              className="absolute top-0 left-0 right-0 pointer-events-none transition-all duration-300 ease-in-out" 
              style={{ 
                height: `${getTrackHeight('video', 80) + getTrackHeight('audio', 64)}px` 
              }}
            >
              <Playhead 
                currentTime={currentTime} 
                duration={duration} 
                height={getTrackHeight('video', 80) + getTrackHeight('audio', 64)} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
