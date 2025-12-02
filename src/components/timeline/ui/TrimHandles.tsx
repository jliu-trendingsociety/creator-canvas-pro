import { useState, useEffect } from "react";
import { indexToPx, pxToIndex, clampTime } from "../coordinateSystem";
import { useTimelineStore } from "../timelineStore";

interface TrimHandlesProps {
  startFrame: number;
  endFrame: number;
  duration: number;
  thumbnailCount: number;
  thumbnailWidth: number;
  onTrimChange: (start: number, end: number) => void;
  onSeek: (time: number) => void;
}

export const TrimHandles = ({
  startFrame,
  endFrame,
  duration,
  thumbnailCount,
  thumbnailWidth,
  onTrimChange,
  onSeek,
}: TrimHandlesProps) => {
  const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null);
  const [startPos, setStartPos] = useState(0);
  const [endPos, setEndPos] = useState(0);

  // Convert time to index, then index to pixel for perfect frame alignment
  useEffect(() => {
    if (thumbnailCount === 0) return;
    const startIndex = Math.floor((startFrame / duration) * thumbnailCount);
    const endIndex = Math.floor((endFrame / duration) * thumbnailCount);
    setStartPos(indexToPx(startIndex, thumbnailWidth));
    setEndPos(indexToPx(endIndex, thumbnailWidth));
  }, [startFrame, endFrame, duration, thumbnailCount, thumbnailWidth]);

  const handleMouseDown = (e: React.MouseEvent, type: 'start' | 'end') => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(type);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || thumbnailCount === 0) return;

    const container = document.getElementById('timeline-container');
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const px = e.clientX - rect.left + container.scrollLeft;
    const index = Math.max(0, Math.min(pxToIndex(px, thumbnailWidth), thumbnailCount - 1));
    const time = (index / thumbnailCount) * duration;

    if (isDragging === 'start') {
      const endIndex = Math.floor((endFrame / duration) * thumbnailCount);
      const newStart = index < endIndex ? time : endFrame - 0.1;
      onTrimChange(newStart, endFrame);
      onSeek(newStart);
    } else if (isDragging === 'end') {
      const startIndex = Math.floor((startFrame / duration) * thumbnailCount);
      const newEnd = index > startIndex ? time : startFrame + 0.1;
      onTrimChange(startFrame, newEnd);
      onSeek(newEnd);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
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
  }, [isDragging, duration, startFrame, endFrame, thumbnailCount, thumbnailWidth]);

  if (thumbnailCount === 0) return null;

  return (
    <>
      {/* Start Handle */}
      <div
        className="absolute top-0 bottom-0 w-2 bg-neon/80 cursor-ew-resize hover:bg-neon z-40 group"
        style={{ left: `${startPos}px` }}
        onMouseDown={(e) => handleMouseDown(e, 'start')}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1 h-8 bg-background rounded-full opacity-60" />
        </div>
      </div>

      {/* End Handle */}
      <div
        className="absolute top-0 bottom-0 w-2 bg-neon/80 cursor-ew-resize hover:bg-neon z-40 group"
        style={{ left: `${endPos}px` }}
        onMouseDown={(e) => handleMouseDown(e, 'end')}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1 h-8 bg-background rounded-full opacity-60" />
        </div>
      </div>

      {/* Trimmed Region Overlays */}
      {startFrame > 0 && (
        <div
          className="absolute top-0 bottom-0 bg-background/60 pointer-events-none z-20"
          style={{ left: 0, width: `${startPos}px` }}
        />
      )}
      {endFrame < duration && (
        <div
          className="absolute top-0 bottom-0 bg-background/60 pointer-events-none z-20"
          style={{ left: `${endPos}px`, width: `${thumbnailCount * thumbnailWidth - endPos}px` }}
        />
      )}
    </>
  );
};
