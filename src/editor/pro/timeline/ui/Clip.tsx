import { useState, useRef, useEffect } from 'react';
import { Clip as ClipType, useTimelineStore } from '../state/timelineStore';
import { pxToTime, timeToPx } from '../core/coordinateSystem';

interface ClipProps {
  clip: ClipType;
  trackId: string;
  duration: number;
  totalWidth: number;
  zoom: number;
}

export const Clip = ({ clip, trackId, duration, totalWidth, zoom }: ClipProps) => {
  const { selectedClipId, setSelectedClip, updateClip } = useTimelineStore();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const clipRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef(0);
  const dragStartTime = useRef(0);

  const isSelected = selectedClipId === clip.id;

  // Calculate clip position
  const left = timeToPx(clip.start, { duration, totalWidth, zoom });
  const right = timeToPx(clip.end, { duration, totalWidth, zoom });
  const width = Math.max(20, right - left);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedClip(clip.id);
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartTime.current = clip.start;
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartX.current;
      setDragOffset(deltaX);

      const deltaTime = pxToTime(deltaX, { duration, totalWidth, zoom });
      const newStart = Math.max(0, dragStartTime.current + deltaTime);
      const clipDuration = clip.end - clip.start;
      const newEnd = Math.min(duration, newStart + clipDuration);

      // Update clip position in real-time
      updateClip(trackId, clip.id, {
        start: newStart,
        end: newEnd,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDragOffset(0);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, clip, trackId, duration, totalWidth, zoom, updateClip]);

  return (
    <div
      ref={clipRef}
      className={`
        absolute top-1 bottom-1 rounded cursor-move transition-all
        ${isSelected
          ? 'bg-neon/20 border-2 border-neon shadow-[0_0_12px_hsl(var(--neon)/0.4)]'
          : 'bg-primary/40 border border-primary/60 hover:bg-primary/60'
        }
        ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
      `}
      style={{
        left: `${left + (isDragging ? dragOffset : 0)}px`,
        width: `${width}px`,
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="px-2 py-1 h-full flex items-center justify-between">
        <span className="text-xs text-foreground/80 truncate font-medium">
          {clip.src.split('/').pop()?.split('.')[0] || 'Clip'}
        </span>
        <span className="text-[10px] text-foreground/50">
          {(clip.end - clip.start).toFixed(1)}s
        </span>
      </div>

      {/* Left drag handle */}
      {isSelected && (
        <>
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-neon cursor-ew-resize hover:w-2 transition-all" />
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-neon cursor-ew-resize hover:w-2 transition-all" />
        </>
      )}
    </div>
  );
};
