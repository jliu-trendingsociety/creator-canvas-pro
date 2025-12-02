import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useTimelineStore } from "../timelineStore";
import { pxToTime } from "../coordinateSystem";
import { formatTime } from "../timeEngine";

interface ThumbnailStripProps {
  thumbnails: string[];
  duration: number;
  currentTime: number;
  startFrame: number;
  endFrame: number;
  onSeek: (time: number) => void;
}

export const ThumbnailStrip = ({
  thumbnails,
  duration,
  currentTime,
  startFrame,
  endFrame,
  onSeek,
}: ThumbnailStripProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setTotalThumbnailWidth } = useTimelineStore();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const thumbnailWidth = 80;
  const thumbnailHeight = 40;
  const thumbnailGap = 4;

  // Calculate and store total thumbnail width
  useEffect(() => {
    if (thumbnails.length > 0) {
      const width = thumbnails.length * thumbnailWidth + (thumbnails.length - 1) * thumbnailGap;
      setTotalThumbnailWidth(width);
    }
  }, [thumbnails.length, thumbnailWidth, thumbnailGap, setTotalThumbnailWidth]);

  const handleThumbnailClick = (index: number) => {
    const time = (index / thumbnails.length) * duration;
    onSeek(time);
  };

  if (thumbnails.length === 0) {
    return (
      <div className="flex gap-2">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="w-16 h-12 bg-surface-elevated/50 rounded animate-pulse shrink-0"
          />
        ))}
      </div>
    );
  }

  const totalWidth = thumbnails.length * thumbnailWidth + (thumbnails.length - 1) * thumbnailGap;

  return (
    <div 
      ref={containerRef}
      className="absolute top-0 left-0 flex flex-row whitespace-nowrap shrink-0 min-w-max"
      style={{ 
        width: `${totalWidth}px`,
        gap: `${thumbnailGap}px`
      }}
    >
      {thumbnails.map((thumb, index) => {
        const timeAtThumb = (index / thumbnails.length) * duration;
        const isInTrimRange = timeAtThumb >= startFrame && timeAtThumb <= endFrame;
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
                "w-full h-full object-cover rounded transition-opacity duration-150",
                !isInTrimRange && "opacity-40"
              )}
            />
            
            {/* Unified Highlight Border */}
            {(hoveredIndex === index || isActive) && (
              <div 
                className={cn(
                  "absolute inset-0 border-2 border-neon rounded pointer-events-none z-30",
                  "transition-opacity duration-150"
                )}
              />
            )}
            
            {/* Hover Preview */}
            {hoveredIndex === index && (
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in duration-200">
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
  );
};
