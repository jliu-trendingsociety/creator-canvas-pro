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
  const trackRef = useRef<HTMLDivElement>(null);

  const effectiveEndFrame = endFrame ?? duration;
  const thumbnailWidth = 80;
  const thumbnailHeight = 45;

  const handleMouseDown = (e: React.MouseEvent, type: 'scrub' | 'start' | 'end') => {
    e.preventDefault();
    setIsDragging(true);
    setDragType(type);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !trackRef.current || !dragType) return;

    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    const time = percentage * duration;

    if (dragType === 'scrub') {
      onSeek(time);
    } else if (dragType === 'start' && onTrimChange) {
      onTrimChange(time, effectiveEndFrame);
    } else if (dragType === 'end' && onTrimChange) {
      onTrimChange(startFrame, time);
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
  }, [isDragging, dragType]);

  const handleThumbnailClick = (index: number) => {
    const time = (index / thumbnails.length) * duration;
    onSeek(time);
  };

  const currentPositionPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const startPositionPercent = duration > 0 ? (startFrame / duration) * 100 : 0;
  const endPositionPercent = duration > 0 ? (effectiveEndFrame / duration) * 100 : 100;

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
    <div className="flex-1 relative">
      <div
        ref={trackRef}
        className="relative h-16 bg-surface rounded-lg border border-border/30 overflow-x-auto overflow-y-hidden cursor-pointer"
        onMouseDown={(e) => handleMouseDown(e, 'scrub')}
      >
        <div className="flex h-full">
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

        {/* Current Position Indicator */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-neon shadow-[0_0_10px_rgba(186,230,55,0.6)] pointer-events-none z-10"
          style={{ left: `${currentPositionPercent}%` }}
        >
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-neon rounded-full shadow-[0_0_8px_rgba(186,230,55,0.8)]" />
        </div>

        {/* Trim Handles */}
        {onTrimChange && (
          <>
            {/* Start Handle */}
            <div
              className="absolute top-0 bottom-0 w-2 bg-neon/80 cursor-ew-resize hover:bg-neon z-20 group"
              style={{ left: `${startPositionPercent}%` }}
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
              className="absolute top-0 bottom-0 w-2 bg-neon/80 cursor-ew-resize hover:bg-neon z-20 group"
              style={{ left: `${endPositionPercent}%` }}
              onMouseDown={(e) => {
                e.stopPropagation();
                handleMouseDown(e, 'end');
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1 h-8 bg-background rounded-full opacity-60" />
              </div>
            </div>

            {/* Trimmed Region Overlay */}
            {startFrame > 0 && (
              <div
                className="absolute top-0 bottom-0 bg-background/60 pointer-events-none z-10"
                style={{ left: 0, width: `${startPositionPercent}%` }}
              />
            )}
            {effectiveEndFrame < duration && (
              <div
                className="absolute top-0 bottom-0 bg-background/60 pointer-events-none z-10"
                style={{ left: `${endPositionPercent}%`, right: 0 }}
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
