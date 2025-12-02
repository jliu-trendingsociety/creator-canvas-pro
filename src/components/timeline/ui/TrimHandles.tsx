import { useState, useEffect } from "react";
import { timeToPx, pxToTime, clampTime } from "../coordinateSystem";
import { useTimelineStore } from "../timelineStore";

interface TrimHandlesProps {
  startFrame: number;
  endFrame: number;
  duration: number;
  onTrimChange: (start: number, end: number) => void;
  onSeek: (time: number) => void;
}

export const TrimHandles = ({
  startFrame,
  endFrame,
  duration,
  onTrimChange,
  onSeek,
}: TrimHandlesProps) => {
  const { totalThumbnailWidth, zoom } = useTimelineStore();
  const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null);
  const [startPos, setStartPos] = useState(0);
  const [endPos, setEndPos] = useState(0);

  // Update positions when props or timeline state change
  useEffect(() => {
    const startPx = timeToPx(startFrame, { duration, totalWidth: totalThumbnailWidth, zoom });
    const endPx = timeToPx(endFrame, { duration, totalWidth: totalThumbnailWidth, zoom });
    setStartPos(startPx);
    setEndPos(endPx);
  }, [startFrame, endFrame, duration, totalThumbnailWidth, zoom]);

  const handleMouseDown = (e: React.MouseEvent, type: 'start' | 'end') => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(type);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || totalThumbnailWidth === 0) return;

    const container = document.getElementById('timeline-container');
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left + container.scrollLeft;
    const clampedX = Math.max(0, Math.min(x, totalThumbnailWidth));
    const time = pxToTime(clampedX, { duration, totalWidth: totalThumbnailWidth, zoom, scrollLeft: 0 });
    const clampedTime = clampTime(time, duration);

    if (isDragging === 'start') {
      const newStart = Math.min(clampedTime, endFrame - 0.1);
      onTrimChange(newStart, endFrame);
      onSeek(newStart);
    } else if (isDragging === 'end') {
      const newEnd = Math.max(clampedTime, startFrame + 0.1);
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
  }, [isDragging, duration, startFrame, endFrame, totalThumbnailWidth, zoom]);

  if (totalThumbnailWidth === 0) return null;

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
          style={{ left: `${endPos}px`, width: `${totalThumbnailWidth - endPos}px` }}
        />
      )}
    </>
  );
};
