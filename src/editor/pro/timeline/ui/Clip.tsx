import { useState, useRef, useEffect } from 'react';
import { Clip as ClipType, useTimelineStore } from '../state/timelineStore';
import { pxToTime, timeToPx } from '../core/coordinateSystem';

interface ClipProps {
  clip: ClipType;
  trackId: string;
  duration: number;
  totalWidth: number;
  zoom: number;
  currentTime?: number;
}

const SNAP_THRESHOLD = 8; // pixels

export const Clip = ({ clip, trackId, duration, totalWidth, zoom, currentTime = 0 }: ClipProps) => {
  const { selectedClipId, setSelectedClip, updateClip, tracks } = useTimelineStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isTrimming, setIsTrimming] = useState<'left' | 'right' | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const clipRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef(0);
  const dragStartTime = useRef(0);
  const originalClipDuration = useRef(0);

  const isSelected = selectedClipId === clip.id;

  // Calculate clip position
  const left = timeToPx(clip.start, { duration, totalWidth, zoom });
  const right = timeToPx(clip.end, { duration, totalWidth, zoom });
  const width = Math.max(20, right - left);

  // Snapping helper
  const getSnappedTime = (time: number): number => {
    const snapPoints: number[] = [];
    
    // Snap to playhead
    snapPoints.push(currentTime);
    
    // Snap to timeline start/end
    snapPoints.push(0, duration);
    
    // Snap to other clips
    tracks.forEach(track => {
      track.clips.forEach(otherClip => {
        if (otherClip.id !== clip.id) {
          snapPoints.push(otherClip.start, otherClip.end);
        }
      });
    });
    
    // Snap to second intervals (timeline ticks)
    for (let t = 0; t <= duration; t += 1) {
      snapPoints.push(t);
    }
    
    // Find closest snap point
    let closestSnap = time;
    let minDistance = SNAP_THRESHOLD / zoom;
    
    snapPoints.forEach(snapPoint => {
      const distance = Math.abs(time - snapPoint);
      const distanceInPx = timeToPx(distance, { duration, totalWidth, zoom });
      if (distanceInPx < SNAP_THRESHOLD && distance < minDistance) {
        closestSnap = snapPoint;
        minDistance = distance;
      }
    });
    
    return closestSnap;
  };

  // Clip drag handler
  const handleClipMouseDown = (e: React.MouseEvent) => {
    if (e.target !== e.currentTarget) return; // Ignore trim handles
    e.stopPropagation();
    setSelectedClip(clip.id);
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartTime.current = clip.start;
  };

  // Trim handle handlers
  const handleTrimMouseDown = (e: React.MouseEvent, side: 'left' | 'right') => {
    e.stopPropagation();
    setSelectedClip(clip.id);
    setIsTrimming(side);
    dragStartX.current = e.clientX;
    dragStartTime.current = side === 'left' ? clip.start : clip.end;
    originalClipDuration.current = clip.end - clip.start;
  };

  useEffect(() => {
    if (!isDragging && !isTrimming) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartX.current;
      setDragOffset(deltaX);

      const deltaTime = pxToTime(deltaX, { duration, totalWidth, zoom });

      if (isDragging) {
        // Moving entire clip
        let newStart = dragStartTime.current + deltaTime;
        newStart = getSnappedTime(newStart);
        newStart = Math.max(0, newStart);
        
        const clipDuration = clip.end - clip.start;
        let newEnd = newStart + clipDuration;
        
        // Ensure clip doesn't go past timeline end
        if (newEnd > duration) {
          newEnd = duration;
          newStart = duration - clipDuration;
        }
        
        // Snap end as well
        newEnd = getSnappedTime(newEnd);

        updateClip(trackId, clip.id, {
          start: newStart,
          end: newEnd,
        });
      } else if (isTrimming) {
        // Trimming clip edge
        if (isTrimming === 'left') {
          let newStart = dragStartTime.current + deltaTime;
          newStart = getSnappedTime(newStart);
          newStart = Math.max(0, Math.min(newStart, clip.end - 0.1)); // Min 0.1s clip
          
          updateClip(trackId, clip.id, {
            start: newStart,
          });
        } else {
          let newEnd = dragStartTime.current + deltaTime;
          newEnd = getSnappedTime(newEnd);
          newEnd = Math.max(clip.start + 0.1, Math.min(newEnd, duration)); // Min 0.1s clip
          
          updateClip(trackId, clip.id, {
            end: newEnd,
          });
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsTrimming(null);
      setDragOffset(0);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isTrimming, clip, trackId, duration, totalWidth, zoom, updateClip, tracks, currentTime]);

  return (
    <div
      ref={clipRef}
      className={`
        absolute top-2 bottom-2 rounded-sm overflow-hidden transition-all
        ${isSelected
          ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-background shadow-[0_0_20px_rgba(96,165,250,0.5)]'
          : 'border border-border/40 hover:border-border shadow-sm'
        }
        ${isDragging ? 'cursor-grabbing opacity-80' : 'cursor-grab'}
      `}
      style={{
        left: `${left}px`,
        width: `${width}px`,
        backgroundColor: isSelected ? 'hsl(var(--neon) / 0.15)' : 'hsl(var(--surface-elevated))',
      }}
      onMouseDown={handleClipMouseDown}
    >
      {/* Clip content */}
      <div className="px-3 py-1.5 h-full flex items-center justify-between pointer-events-none select-none">
        <span className="text-xs text-foreground font-medium truncate">
          {clip.src.split('/').pop()?.split('.')[0] || 'Video Clip'}
        </span>
        <span className="text-[10px] text-muted-foreground font-mono ml-2">
          {(clip.end - clip.start).toFixed(2)}s
        </span>
      </div>

      {/* Trim handles - Premiere style */}
      {isSelected && (
        <>
          {/* Left trim handle */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-400 cursor-ew-resize hover:w-2 hover:bg-blue-300 transition-all z-10"
            onMouseDown={(e) => handleTrimMouseDown(e, 'left')}
            title="Trim start"
          >
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-400 rounded-r" />
          </div>
          
          {/* Right trim handle */}
          <div
            className="absolute right-0 top-0 bottom-0 w-1.5 bg-blue-400 cursor-ew-resize hover:w-2 hover:bg-blue-300 transition-all z-10"
            onMouseDown={(e) => handleTrimMouseDown(e, 'right')}
            title="Trim end"
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-400 rounded-l" />
          </div>
        </>
      )}
      
      {/* Snap indicator */}
      {(isDragging || isTrimming) && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-neon text-background text-[10px] font-mono rounded whitespace-nowrap pointer-events-none">
          {clip.start.toFixed(2)}s - {clip.end.toFixed(2)}s
        </div>
      )}
    </div>
  );
};
