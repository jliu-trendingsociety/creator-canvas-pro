import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TimelineTrackProps {
  thumbnails: string[];
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  onTrimChange?: (start: number, end: number) => void;
  startFrame?: number;
  endFrame?: number;
}

export const TimelineTrack = ({
  thumbnails,
  currentTime,
  duration,
  onSeek,
  onTrimChange,
  startFrame = 0,
  endFrame,
}: TimelineTrackProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [dragType, setDragType] = useState<'scrub' | 'start' | 'end' | null>(null);
  const [totalThumbnailWidth, setTotalThumbnailWidth] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbnailsContainerRef = useRef<HTMLDivElement>(null);

  const effectiveEndFrame = endFrame ?? duration;
  const thumbnailWidth = 80;
  const thumbnailHeight = 45;
  const thumbnailGap = 4;

  const handleMouseDown = (e: React.MouseEvent, type: 'scrub' | 'start' | 'end') => {
    e.preventDefault();
    setIsDragging(true);
    setDragType(type);
  };

  // Compute total thumbnail width on mount and when thumbnails change
  useEffect(() => {
    if (thumbnailsContainerRef.current && thumbnails.length > 0) {
      const width = thumbnails.length * thumbnailWidth + (thumbnails.length - 1) * thumbnailGap;
      setTotalThumbnailWidth(width);
    }
  }, [thumbnails.length, thumbnailWidth, thumbnailGap]);

  // Handle scroll to update playhead position
  const handleScroll = () => {
    if (trackRef.current) {
      setScrollLeft(trackRef.current.scrollLeft);
    }
  };

  // Recompute on window resize
  useEffect(() => {
    const handleResize = () => {
      if (thumbnailsContainerRef.current && thumbnails.length > 0) {
        const width = thumbnails.length * thumbnailWidth + (thumbnails.length - 1) * thumbnailGap;
        setTotalThumbnailWidth(width);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [thumbnails.length, thumbnailWidth, thumbnailGap]);

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !trackRef.current || !dragType || totalThumbnailWidth === 0) return;

    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left + scrollLeft, totalThumbnailWidth));
    const percentage = x / totalThumbnailWidth;
    const time = percentage * duration;

    if (dragType === 'scrub') {
      // Scrubbing updates current time
      onSeek(time);
    } else if (dragType === 'start' && onTrimChange) {
      // Dragging start handle updates trim point AND seeks to that point
      onTrimChange(time, effectiveEndFrame);
      onSeek(time);
    } else if (dragType === 'end' && onTrimChange) {
      // Dragging end handle updates trim point AND seeks to that point
      onTrimChange(startFrame, time);
      onSeek(time);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragType(null);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragType, duration, startFrame, effectiveEndFrame, onSeek, onTrimChange, totalThumbnailWidth, scrollLeft]);

  const handleThumbnailClick = (index: number) => {
    const time = (index / thumbnails.length) * duration;
    onSeek(time);
  };

  // Use pixel positioning instead of percentages
  const currentPositionPx = duration > 0 && totalThumbnailWidth > 0 
    ? (currentTime / duration) * totalThumbnailWidth 
    : 0;
  const startPositionPx = duration > 0 && totalThumbnailWidth > 0 
    ? (startFrame / duration) * totalThumbnailWidth 
    : 0;
  const endPositionPx = duration > 0 && totalThumbnailWidth > 0 
    ? (effectiveEndFrame / duration) * totalThumbnailWidth 
    : totalThumbnailWidth;

  if (thumbnails.length === 0) {
    return (
      <div className="flex-1 h-16 bg-surface rounded-lg border border-border/30 flex items-center justify-center">
        <div className="flex gap-2">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="w-16 h-12 bg-surface-elevated/50 rounded animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative min-w-0">
      <div
        ref={trackRef}
        className="relative h-16 bg-surface rounded-lg border border-border/30 overflow-x-auto overflow-y-hidden cursor-pointer pb-1"
        onMouseDown={(e) => handleMouseDown(e, 'scrub')}
        onScroll={handleScroll}
      >
        <div 
          ref={thumbnailsContainerRef}
          className="absolute top-0 left-0 flex flex-row whitespace-nowrap shrink-0 min-w-max"
          style={{ 
            width: totalThumbnailWidth > 0 ? `${totalThumbnailWidth}px` : 'auto',
            gap: `${thumbnailGap}px`
          }}
        >
          {thumbnails.map((thumb, index) => {
            const timeAtThumb = (index / thumbnails.length) * duration;
            const isInTrimRange = timeAtThumb >= startFrame && timeAtThumb <= effectiveEndFrame;
            const isActive = Math.abs(timeAtThumb - currentTime) < (duration / thumbnails.length);

            return (
              <div
                key={index}
                className="relative flex-shrink-0 group"
                style={{ width: thumbnailWidth, height: thumbnailHeight }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  handleThumbnailClick(index);
                }}
              >
                <img
                  src={thumb}
                  alt={`Frame ${index}`}
                  className={cn(
                    "w-full h-full object-cover border transition-all",
                    isActive && "border-neon border-2 shadow-[0_0_10px_rgba(186,230,55,0.4)]",
                    !isActive && "border-border/50",
                    !isInTrimRange && "opacity-40",
                    "hover:border-neon/50 hover:scale-105"
                  )}
                />
                
                {/* Hover Preview */}
                {hoveredIndex === index && (
                  <div className="absolute -top-24 left-1/2 -translate-x-1/2 z-20 animate-in fade-in duration-200">
                    <div className="bg-surface-elevated border border-neon/50 rounded-lg p-2 shadow-2xl">
                      <img
                        src={thumb}
                        alt="Preview"
                        className="w-32 h-18 object-cover rounded"
                      />
                      <div className="text-xs text-neon text-center mt-1 font-mono">
                        {formatTime(timeAtThumb)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Current Position Indicator - Pixel Positioned */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-neon shadow-[0_0_10px_rgba(186,230,55,0.6)] pointer-events-none z-30"
          style={{ left: `${currentPositionPx}px` }}
        >
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-neon rounded-full shadow-[0_0_8px_rgba(186,230,55,0.8)]" />
        </div>

        {/* Trim Handles - Pixel Positioned */}
        {onTrimChange && (
          <>
            {/* Start Handle */}
            <div
              className="absolute top-0 bottom-0 w-2 bg-neon/80 cursor-ew-resize hover:bg-neon z-40 group"
              style={{ left: `${startPositionPx}px` }}
              onMouseDown={(e) => {
                e.stopPropagation();
                handleMouseDown(e, 'start');
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1 h-8 bg-background rounded-full opacity-60" />
              </div>
            </div>

            {/* End Handle */}
            <div
              className="absolute top-0 bottom-0 w-2 bg-neon/80 cursor-ew-resize hover:bg-neon z-40 group"
              style={{ left: `${endPositionPx}px` }}
              onMouseDown={(e) => {
                e.stopPropagation();
                handleMouseDown(e, 'end');
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1 h-8 bg-background rounded-full opacity-60" />
              </div>
            </div>

            {/* Trimmed Region Overlay - Pixel Positioned */}
            {startFrame > 0 && (
              <div
                className="absolute top-0 bottom-0 bg-background/60 pointer-events-none z-20"
                style={{ left: 0, width: `${startPositionPx}px` }}
              />
            )}
            {effectiveEndFrame < duration && (
              <div
                className="absolute top-0 bottom-0 bg-background/60 pointer-events-none z-20"
                style={{ left: `${endPositionPx}px`, width: `${totalThumbnailWidth - endPositionPx}px` }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};
